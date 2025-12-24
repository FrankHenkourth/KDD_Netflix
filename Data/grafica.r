
library(tidyverse)
library(ggplot2)


# dataset

netflix <- read.csv("C:/Lubbock/Programming/DataFrames/KDD_Netflix/Data/netflix_titles.csv", stringsAsFactors = FALSE)
print(str(netflix))



# duplicados
netflix_clean <- netflix %>% distinct()

# formato
netflix_clean$date_added <- as.Date(netflix_clean$date_added, format = "%B %d, %Y")

# duration
netflix_clean$duration_num <- as.numeric(str_extract(netflix_clean$duration, "\\d+"))

# vacios
netflix_clean[netflix_clean == ""] <- NA
print(colSums(is.na(netflix_clean)))

# ============================
# Visualización simple
# ============================


ggplot(netflix_clean, aes(x = type)) +
  geom_bar(fill = "steelblue") +
  theme_minimal() +
  labs(
    title = "Cantidad de Películas vs Series en Netflix",
    x = "Tipo de contenido",
    y = "Cantidad"
  )



ggplot(netflix_clean, aes(x = rating)) +
  geom_bar(fill = "darkred") +
  theme_minimal() +
  labs(
    title = "Distribución de Clasificaciones (Rating)",
    x = "Rating",
    y = "Frecuencia"
  )
