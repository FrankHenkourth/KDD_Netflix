import os
from flask import Flask, render_template, request
import joblib
import numpy as np

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS = os.path.join(BASE_DIR, "artifacts")

MODEL_PATH = os.path.join(ARTIFACTS, "rf_model.joblib")
FEATURE_COLUMNS_PATH = os.path.join(ARTIFACTS, "feature_columns.joblib")
RATING_ENCODER_PATH = os.path.join(ARTIFACTS, "rating_encoder.joblib")
GENRES_PATH = os.path.join(ARTIFACTS, "top_genres.joblib")
COUNTRIES_PATH = os.path.join(ARTIFACTS, "top_countries.joblib")
TARGET_ENCODER_PATH = os.path.join(ARTIFACTS, "target_encoder.joblib")

model = joblib.load(MODEL_PATH)
feature_columns = joblib.load(FEATURE_COLUMNS_PATH)
rating_encoder = joblib.load(RATING_ENCODER_PATH)
top_genres = joblib.load(GENRES_PATH)
top_countries = joblib.load(COUNTRIES_PATH)
target_encoder = joblib.load(TARGET_ENCODER_PATH)


def extract_duration(x):
    import re
    if x is None:
        return 0
    m = re.search(r"(\d+)", str(x))
    return int(m.group(1)) if m else 0


def genres_multi_hot(genres_str):
    out = {f"genre__{g}": 0 for g in top_genres}
    if not genres_str:
        return out
    parts = [p.strip() for p in genres_str.split(",")]
    for p in parts:
        if p in top_genres:
            out[f"genre__{p}"] = 1
    return out


def country_one_hot(country_str):
    out = {f"country__{c}": 0 for c in top_countries}
    if country_str in top_countries:
        out[f"country__{country_str}"] = 1
    return out


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        form = {
            "title": request.form.get("title"),
            "country": request.form.get("country"),
            "release_year": request.form.get("release_year"),
            "duration": request.form.get("duration"),
            "rating": request.form.get("rating"),
            "listed_in": request.form.get("listed_in"),
        }

        duration_num = extract_duration(form["duration"])
        release_year = int(form["release_year"])
        rating_encoded = rating_encoder.transform([form["rating"]])[0]

        g_dict = genres_multi_hot(form["listed_in"])
        c_dict = country_one_hot(form["country"])

        row = {
            "duration_num": duration_num,
            "release_year": release_year,
            "rating": rating_encoded,
        }

        row.update(g_dict)
        row.update(c_dict)

        final_row = []
        for col in feature_columns:
            final_row.append(row.get(col, 0))

        final_row = np.array(final_row).reshape(1, -1)

        y_pred = model.predict(final_row)[0]
        y_proba = model.predict_proba(final_row)[0].max()

        prediction = target_encoder.inverse_transform([y_pred])[0]

        return render_template(
            "index.html",
            prediction=prediction,
            proba=float(y_proba),
            form=form
        )

    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
