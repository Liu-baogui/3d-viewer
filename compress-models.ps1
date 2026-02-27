# 压缩模型文件为 .glb.gz 格式
$modelsPath = ".\models"
$modelFiles = Get-ChildItem -Path $modelsPath -Filter "*.glb"

foreach ($file in $modelFiles) {
    $inputPath = $file.FullName
    $outputPath = "$inputPath.gz"
    
    Write-Host "Compressing $($file.Name) to $($outputPath)"
    
    try {
        # 检查输入文件是否存在且大小大于0
        if (-not (Test-Path $inputPath)) {
            Write-Host "Input file does not exist: $inputPath"
            continue
        }
        
        $originalSize = $file.Length
        Write-Host "Original size: $originalSize bytes"
        
        if ($originalSize -eq 0) {
            Write-Host "Skipping empty file: $($file.Name)"
            continue
        }
        
        # 使用 .NET GzipStream 进行压缩
        $inputStream = [System.IO.File]::OpenRead($inputPath)
        $outputStream = [System.IO.File]::Create($outputPath)
        $gzipStream = New-Object System.IO.Compression.GzipStream($outputStream, [System.IO.Compression.CompressionMode]::Compress)
        
        $buffer = New-Object byte[](1024*1024) # 1MB buffer
        $bytesRead = 0
        
        while (($bytesRead = $inputStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
            $gzipStream.Write($buffer, 0, $bytesRead)
        }
        
        # 关闭流（按正确的顺序）
        $gzipStream.Close()
        $outputStream.Close()
        $inputStream.Close()
        
        # 检查输出文件是否存在
        if (Test-Path $outputPath) {
            $compressedFile = Get-Item $outputPath
            $compressedSize = $compressedFile.Length
            Write-Host "Compressed size: $compressedSize bytes"
            
            if ($compressedSize -gt 0 -and $originalSize -gt 0) {
                $compressionRatio = [math]::Round(($originalSize - $compressedSize) / $originalSize * 100, 2)
                Write-Host "Compression complete: $compressionRatio% reduction"
            } else {
                Write-Host "Compression complete, but could not calculate compression ratio"
            }
        } else {
            Write-Host "Error: Compressed file was not created"
        }
    } catch {
        Write-Host "Error compressing $($file.Name): $_"
        Write-Host "Error details: $($_.Exception.Message)"
    }
}

Write-Host "Compression process completed!"