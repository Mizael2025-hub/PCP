@echo off
setlocal

:: Solicita a mensagem do commit ao usuário
set /p commit_msg="Digite a descricao do commit: "

:: Verifica se a mensagem nao esta vazia
if "%commit_msg%"=="" (
    echo A mensagem do commit nao pode estar vazia!
    pause
    exit /b
)

:: Executa os comandos do git
echo Adicionando arquivos...
git add .

echo Realizando commit...
git commit -m "%commit_msg%"

echo Enviando para o GitHub...
git push origin main

echo.
echo Processo finalizado com sucesso!
pause