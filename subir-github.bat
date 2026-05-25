@echo off
title Asistente de Subida a GitHub (Ultra-Robusto) - StockFlow
color 0b

echo ========================================================
echo        BIENVENIDO AL ASISTENTE DE SUBIDA A GITHUB
echo ========================================================
echo.
echo Este asistente auto-configurara tu Git y subira tu proyecto.
echo Si algo falla, mantendra la pantalla abierta para ver el error.
echo.

:: 1. Verificar si git responde en esta consola
git --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0c
    echo [ERROR] Git todavia no es reconocido por Windows.
    echo.
    echo Posibles causas:
    echo 1. Acabas de instalar Git pero no has cerrado tu editor o reiniciado la consola.
    echo    SOLUCION: Cierra VS Code o tu editor por completo y vuelve a abrirlo.
    echo 2. Git se instalo pero no se agrego a la variable PATH.
    echo.
    echo Intentando buscar la ruta por defecto de Git en tu sistema...
    if exist "C:\Program Files\Git\cmd\git.exe" (
        echo [OK] Git encontrado en C:\Program Files\Git\cmd\git.exe. Cargándolo al PATH de esta sesion...
        set "PATH=%PATH%;C:\Program Files\Git\cmd"
    ) else (
        echo [ERROR] No logramos encontrar la ruta por defecto de Git.
        echo Asegúrate de completar la instalacion de Git para Windows.
        pause
        exit
    )
)

echo [OK] Git detectado e integrado correctamente.
echo.

:: 2. Auto-Configurar Identidad de Git si no existe (Causa #1 de fallos en primer uso)
git config --global user.email >nul 2>&1
if %errorlevel% neq 0 (
    color 0e
    echo --------------------------------------------------------
    echo  Configuracion Inicial: Identidad de Git requerida
    echo --------------------------------------------------------
    echo Como acabas de instalar Git, es necesario configurarlo.
    echo.
    set /p git_email="1. Ingresa tu correo de GitHub: "
    set /p git_name="2. Ingresa tu nombre completo o usuario: "
    
    git config --global user.email "%git_email%"
    git config --global user.name "%git_name%"
    color 0b
    echo.
    echo [OK] Identidad configurada correctamente.
    echo.
)

:: 3. Inicializar repositorio
if not exist .git (
    echo [1/5] Inicializando repositorio Git...
    git init
    git branch -M main
) else (
    echo [1/5] Repositorio Git ya existente.
)

:: 4. Agregar archivos
echo [2/5] Agregando archivos a la cola de subida...
git add .

:: 5. Hacer commit
echo [3/5] Creando punto de guardado (Commit)...
git commit -m "feat: implementacion completa StockFlow local con SQLite" >nul 2>&1
if %errorlevel% neq 0 (
    :: Re-intentar forzosamente si habia errores de commit previos
    git commit -m "feat: implementacion completa StockFlow local con SQLite"
)

echo.
echo ========================================================
echo    Paso 4: Ingresa tu URL de Repositorio de GitHub
echo ========================================================
echo Ve a tu GitHub, crea un repositorio VACIO (sin README.md, sin .gitignore)
echo y copia su enlace HTTPS o SSH (ej: https://github.com/tu-usuario/nombre-repo.git)
echo.
set /p repo_url="Pega la URL de tu repositorio de GitHub y presiona ENTER: "

if "%repo_url%"=="" (
    color 0c
    echo [ERROR] No ingresaste ninguna URL. Proceso cancelado.
    pause
    exit
)

:: Limpiar e ingresar remote
git remote remove origin >nul 2>&1
git remote add origin %repo_url%

echo.
echo [5/5] Subiendo codigo a GitHub...
echo (Nota: Si te lo pide, inicia sesion en la ventana emergente)
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
    echo [ERROR DETECTADO] Hubo un problema al subir a GitHub.
    echo Revisa detalladamente los mensajes de arriba en rojo.
    echo Si te dio un error de autenticacion o login, vuelve a ejecutar el archivo.
)

echo.
pause
