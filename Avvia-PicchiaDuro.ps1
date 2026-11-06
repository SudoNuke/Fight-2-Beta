$ErrorActionPreference = 'Stop'
$root = (Join-Path $PSScriptRoot 'dist')
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://127.0.0.1:8765/')
try {
  $listener.Start()
  Write-Host 'PicchiaDuro server attivo su http://127.0.0.1:8765/' -ForegroundColor Green
  Start-Process 'http://127.0.0.1:8765/'
  $types = @{
    '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.mjs'='text/javascript; charset=utf-8';
    '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.svg'='image/svg+xml'; '.json'='application/json'; '.txt'='text/plain; charset=utf-8'
  }
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    try {
      $relative = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
      if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }
      $file = [IO.Path]::GetFullPath((Join-Path $root $relative))
      $rootFull = [IO.Path]::GetFullPath($root)
      if (-not $file.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $file -PathType Leaf)) {
        $context.Response.StatusCode = 404
        $body = [Text.Encoding]::UTF8.GetBytes('404 - File non trovato')
      } else {
        $body = [IO.File]::ReadAllBytes($file)
        $ext = [IO.Path]::GetExtension($file).ToLowerInvariant()
        $context.Response.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' }
        $context.Response.StatusCode = 200
      }
      $context.Response.ContentLength64 = $body.Length
      $context.Response.OutputStream.Write($body, 0, $body.Length)
    } catch { $context.Response.StatusCode = 500 } finally { $context.Response.Close() }
  }
} catch {
  Write-Host "Errore server: $($_.Exception.Message)" -ForegroundColor Red
  Read-Host 'Premi INVIO per chiudere'
} finally { if ($listener.IsListening) { $listener.Stop() }; $listener.Close() }
