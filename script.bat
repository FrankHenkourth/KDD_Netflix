@echo off
setlocal enabledelayedexpansion

echo ============================================
echo    KDD Netflix - Setup & Execution
echo ============================================

REM Paso 1: Crear entorno virtual
echo [1/4] Creando entorno virtual...
python -m venv kdd_netflix

if errorlevel 1 (
    echo Error: No se pudo crear el entorno virtual.
    echo Asegúrate de tener Python instalado y en el PATH.
    pause
    exit /b 1
)

REM Paso 2: Activar entorno virtual
echo [2/4] Activando entorno virtual...
call kdd_netflix\Scripts\activate.bat

if errorlevel 1 (
    echo Error: No se pudo activar el entorno virtual.
    pause
    exit /b 1
)

REM Paso 3: Instalar dependencias
echo [3/4] Instalando dependencias...
pip install --upgrade pip
pip install -r requirements.txt

if errorlevel 1 (
    echo Error: No se pudieron instalar las dependencias.
    echo Verifica que requirements.txt exista en este directorio.
    pause
    exit /b 1
)

REM Paso 4: Verificar estructura de carpetas
echo Verificando estructura de carpetas...
if not exist "Data\netflix_titles.csv" (
    echo Error: No se encuentra el dataset.
    echo Asegúrate de tener Data\netflix_titles.csv en este directorio.
    pause
    exit /b 1
)

REM Paso 5: Ejecutar Jupyter Notebook
echo [4/4] Iniciando Jupyter Notebook...
echo.
echo El notebook se abrirá en tu navegador...
echo.
echo Si no se abre automáticamente, copia y pega esta URL en tu navegador:
echo http://localhost:8888
echo.
echo Presiona Ctrl+C en esta ventana para detener Jupyter cuando termines.
echo.

timeout /t 3 /nobreak >nul

jupyter notebook kdd_netflix.ipynb

pause