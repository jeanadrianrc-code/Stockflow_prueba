@echo off
title Asistente de Subida a GitHub - StockFlow
color 0b
echo ========================================================
echo        BIENVENIDO AL ASISTENTE DE SUBIDA A GITHUB
echo ========================================================
echo.
echo Este asistente inicializara Git, creara tu commit inicial 
echo y subira todo el codigo a tu cuenta de GitHub de forma segura.
echo.

:: Verificar si git esta disponible en esta nueva sesion
git --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0c
    echo [ERROR] Git todavia no es reconocido por Windows.
    echo Por favor, asegúrate de reiniciar tu computadora si acabas de instalarlo
    echo para que Windows cargue las variables de entorno correctamente.
    echo.
    pause
    exit
)

echo [OK] Git detectado correctamente.
echo.

:: Inicializar git si no esta inicializado
if not exist .git (
    echo [1/4] Inicializando repositorio Git...
    git init
    git branch -M main
) else (
    echo [1/4] Repositorio Git ya existente.
)

echo.
echo [2/4] Preparando archivos para subir (omitiendo temporales y base de datos)...
git add .

echo.
echo [3/4] Creando commit inicial...
git commit -m "feat: implementacion completa StockFlow local con SQLite"

echo.
echo ========================================================
echo    Paso 4: Ingresa tu URL de Repositorio de GitHub
echo ========================================================
echo Ve a tu GitHub, crea un repositorio VACIO (sin README.md, sin .gitignore)
echo y copia su enlace HTTPS o SSH (ej: https://github.com/tu-usuario/nombre-repo.git)
echo.
set /p repo_url="Pega la URL de tu repositorio de GitHub y presiona ENTER: "

if "%repo_url%"=="" (
    echo [ERROR] No ingresaste ninguna URL. Intentalo de nuevo.
    pause
    exit
)

:: Remover remote viejo si existe
git remote remove origin >nul 2>&1

:: Agregar nuevo remote
git remote add origin %repo_url%

echo.
echo [4/4] Subiendo codigo a GitHub...
echo (Nota: Si es la primera vez, se abrira una ventana para iniciar sesion en GitHub)
echo.
git push -u origin main

if %errorlevel% eq 0 (
    color 0a
    echo.
    echo ========================================================
    echo   ¡TODO LISTO! Tu codigo se ha subido con exito.
    echo ========================================================
    echo Ya puedes ir a Render.com, conectar este repositorio 
    echo y lanzar tu demostracion online funcional.
) else (
    color 0c
    echo.
    echo [ERROR] Hubo un problema al subir a GitHub. 
    echo Revisa tu conexion a internet o si el repositorio ya tenia archivos previos.
)

echo.
pause
