# create_db_and_train.py
import os
import sqlite3
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib

# ==============================================================
# **RUTAS AJUSTADAS A TU PROYECTO**
# ==============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))     # /KDD_NETFLIX/App
ROOT_DIR = os.path.dirname(BASE_DIR)                      # /KDD_NETFLIX

CSV_PATH = os.path.join(ROOT_DIR, "Data", "netflix_titles.csv")
DB_PATH = os.path.join(ROOT_DIR, "Data", "netflix.db")

ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

print("📂 CSV:", CSV_PATH)
print("📂 DB PATH:", DB_PATH)
print("📂 ARTIFACTS:", ARTIFACTS_DIR)

# ==============================================================
# 1) CARGAR CSV
# ==============================================================

df = pd.read_csv(CSV_PATH)

# ==============================================================
# 2) LIMPIEZA BÁSICA
# ==============================================================

df = df[['type', 'title', 'country', 'release_year', 'rating', 'duration', 'listed_in']].copy()
df = df.dropna(subset=['type', 'release_year'])

for c in ['country', 'rating', 'duration', 'listed_in']:
    df[c] = df[c].astype(str).replace({'nan': None})

# ==============================================================
# 3) EXTRAER DURACIÓN NUMÉRICA
# ==============================================================

def extract_duration(x):
    if pd.isna(x):
        return np.nan
    import re
    m = re.search(r'(\d+)', str(x))
    return int(m.group(1)) if m else np.nan

df['duration_num'] = df['duration'].apply(extract_duration)

# ==============================================================
# 4) PAÍS PRINCIPAL
# ==============================================================

df['country'] = df['country'].fillna('Unknown').apply(
    lambda s: s.split(',')[0].strip() if isinstance(s, str) else 'Unknown'
)

# ==============================================================
# 5) GENERO / CATEGORÍA
# ==============================================================

df['listed_in'] = df['listed_in'].fillna('Unknown')
df['rating'] = df['rating'].fillna('UNKNOWN')

# ==============================================================
# 6) TOP-K FEATURES
# ==============================================================

all_genres = df['listed_in'].str.split(',').explode().str.strip().value_counts()
top_genres = list(all_genres.head(10).index)
joblib.dump(top_genres, os.path.join(ARTIFACTS_DIR, "top_genres.joblib"))

top_countries = df['country'].value_counts().head(10).index.tolist()
joblib.dump(top_countries, os.path.join(ARTIFACTS_DIR, "top_countries.joblib"))

# ==============================================================
# 7) ENCODING DE FEATURES
# ==============================================================

def genres_multi_hot(genres_str, top_genres):
    out = {f"genre__{g}": 0 for g in top_genres}
    if pd.isna(genres_str):
        return out
    parts = [p.strip() for p in genres_str.split(',')]
    for p in parts:
        if p in top_genres:
            out[f"genre__{p}"] = 1
    return out


def country_one_hot(country_str, top_countries):
    out = {f"country__{c}": 0 for c in top_countries}
    if country_str in top_countries:
        out[f"country__{country_str}"] = 1
    return out


features = pd.DataFrame()
features['duration_num'] = df['duration_num'].fillna(df['duration_num'].median())
features['release_year'] = df['release_year'].fillna(df['release_year'].median()).astype(int)

rating_le = LabelEncoder()
features['rating'] = rating_le.fit_transform(df['rating'].astype(str))
joblib.dump(rating_le, os.path.join(ARTIFACTS_DIR, "rating_encoder.joblib"))

genre_dfs = df['listed_in'].apply(lambda x: pd.Series(genres_multi_hot(x, top_genres)))
country_dfs = df['country'].apply(lambda x: pd.Series(country_one_hot(x, top_countries)))

features = pd.concat([features.reset_index(drop=True),
                      genre_dfs.reset_index(drop=True),
                      country_dfs.reset_index(drop=True)], axis=1)

# Target
le_target = LabelEncoder()
y = le_target.fit_transform(df['type'].astype(str))
joblib.dump(le_target, os.path.join(ARTIFACTS_DIR, "target_encoder.joblib"))

# ==============================================================
# 8) SPLIT Y ENTRENAMIENTO DEL MODELO
# ==============================================================

X_train, X_test, y_train, y_test = train_test_split(
    features, y, test_size=0.3, random_state=42, stratify=y
)

rf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)

# ==============================================================
# 9) GUARDAR MODELO Y FEATURES
# ==============================================================

joblib.dump(rf, os.path.join(ARTIFACTS_DIR, "rf_model.joblib"))
joblib.dump(list(features.columns), os.path.join(ARTIFACTS_DIR, "feature_columns.joblib"))

# ==============================================================
# 10) GUARDAR BASE DE DATOS SQLITE EN /Data/
# ==============================================================

conn = sqlite3.connect(DB_PATH)
df.to_sql("netflix_raw", conn, if_exists="replace", index=False)

features_with_target = features.copy()
features_with_target['type'] = df['type'].values
features_with_target.to_sql("netflix_features", conn, if_exists="replace", index=False)
conn.close()

# ==============================================================
# 11) METRICAS DEL MODELO
# ==============================================================

from sklearn.metrics import classification_report, accuracy_score

y_pred = rf.predict(X_test)
print("\nACCURACY:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred, digits=6))

print("\n✅ ARTIFACTS saved in:", ARTIFACTS_DIR)
print("✅ DATABASE saved at:", DB_PATH)
