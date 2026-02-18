@echo off
echo 启动本地HTTP服务器...
echo 访问地址: http://localhost:8000/index.html
python -m http.server 8000
pause
