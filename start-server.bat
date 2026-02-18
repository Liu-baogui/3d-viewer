@echo off
echo 启动本地HTTP服务器...
echo 访问地址: http://localhost:8000/index02.html
python -m http.server 8000
pause
