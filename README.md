# Proyecto KDD - Análisis de Títulos de Netflix

![Netflix Titles Analysis](https://i.imgur.com/5J0Jj3r.png)

## Descripción

Este proyecto aplica la metodología KDD (Knowledge Discovery in Databases) al dataset "Netflix Titles" para desarrollar un sistema de clasificación que determina si un título es una película o una serie. El análisis incluye preprocesamiento de datos, selección de características, modelado con algoritmos de aprendizaje automático y evaluación de modelos.

La aplicación implementada en Flask permite a los usuarios introducir datos de un título de Netflix y comparar los resultados de los diferentes modelos de clasificación implementados.

## Características principales

- Análisis exploratorio del dataset de títulos de Netflix
- Preprocesamiento de datos y transformación de variables categóricas
- Implementación y comparación de tres algoritmos de clasificación:
  - K-Nearest Neighbors (KNN)
  - Árbol de Decisión (ID3)
  - Random Forest
- Evaluación detallada de los modelos usando métricas como precisión, recall y F1-score
- Interfaz web interactiva para clasificar nuevos títulos
- Visualizaciones detalladas del análisis y resultados

## Estructura del proyecto

```
.
├── .vscode/                # Configuración de VS Code
├── App/                    # Aplicación Flask
│   ├── artifacts/          # Archivos generados por la aplicación
│   ├── static/             # Archivos estáticos (CSS, JS, imágenes)
│   ├── templates/          # Plantillas HTML
│   ├── app.py              # Código principal de la aplicación
│   └── db.py               # Conexión a base de datos
├── artifacts/              # Archivos generados durante el análisis
├── Assets/                 # Recursos adicionales
├── Data/                   # Datos y visualizaciones
│   ├── grafica.r           # Script R para visualizaciones
│   ├── netflix_titles.csv  # Dataset de Netflix Titles
│   └── netflix.db          # Base de datos SQLite
├── kdd_netflix/            # Análisis KDD
│   ├── Include/            # Inclusiones
│   ├── Lib/                # Librerías
│   ├── Scripts/            # Scripts auxiliares
│   └── share/              # Recursos compartidos
├── .gitignore              # Archivos ignorados por Git
├── .gitattributes          # Atributos de Git
├── pyvenv.cfg              # Configuración del entorno virtual
├── env.txt                 # Variables de entorno
├── kdd_netflix.ipynb       # Notebook Jupyter con el análisis detallado
└── requirements.txt        # Dependencias del proyecto
```

## Requisitos

- Python 3.8 o superior
- Jupyter Notebook (para ejecutar el análisis)
- Entorno virtual (recomendado)

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/kdd-netflix-titles.git
cd kdd-netflix-titles
```

2. Crea y activa un entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows
```

3. Instala las dependencias:
```bash
pip install -r requirements.txt
```

4. Prepara los datos:
```bash
# El dataset netflix_titles.csv ya está incluido en Data/
# Para generar la base de datos:
python Data/grafica.r
```

## Uso

### Ejecutar el análisis

1. Inicia Jupyter Notebook:
```bash
jupyter notebook
```

2. Abre `kdd_netflix.ipynb` y ejecuta todas las celdas para reproducir el análisis.

### Ejecutar la aplicación web

1. Inicia la aplicación Flask:
```bash
cd App
python app.py
```

2. Accede a la aplicación en tu navegador:
```
http://localhost:5000
```

3. Ingresa los datos de un título de Netflix y compara los resultados de los diferentes modelos de clasificación.

## Resultados clave

El análisis reveló que **Random Forest** es el algoritmo más adecuado para este dataset, proporcionando un equilibrio óptimo entre precisión y generalización con los siguientes resultados:

- **Precisión**: 0.9978
- **Recall**: 0.9991
- **F1-score**: 0.9985

El modelo Random Forest demostró ser superior en la clasificación de títulos de Netflix como películas o series, con una alta capacidad para generalizar y menor tendencia al sobreajuste comparado con los otros algoritmos evaluados.

## Contribuir

Si deseas contribuir al proyecto:

1. Crea un fork del repositorio
2. Crea una rama con tu característica (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios
4. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
5. Sube a la rama (`git push origin feature/AmazingFeature`)
6. Abre un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más información.

## Contacto

Frank Ernesto Cortiñas Peña - [henkourth202003@gmail.com](mailto:henkourth202003@gmail.com)

Proyecto desarrollado para la asignatura Aprendizaje Automático en la Universidad de las Ciencias Informáticas.
