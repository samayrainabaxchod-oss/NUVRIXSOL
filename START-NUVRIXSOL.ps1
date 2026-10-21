$ErrorActionPreference = "Stop"
$port = 8080
$folder = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $folder
$listener = $null
try {
  $listener = New-Object System.Net.HttpListener
  $listener.Prefixes.Add("http://localhost:$port/")
  $listener.Start()
  Write-Host "NuvrixSol preview running at http://localhost:$port" -ForegroundColor Green
  Write-Host "Keep this PowerShell window open. Press Ctrl+C to stop." -ForegroundColor Yellow
  Start-Process "http://localhost:$port"
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }
    $target = Join-Path $folder $rel
    if (Test-Path $target -PathType Leaf) {
      $bytes = [IO.File]::ReadAllBytes($target)
      $ext = [IO.Path]::GetExtension($target).ToLowerInvariant()
      $ctx.Response.ContentType = switch ($ext) { ".html" {"text/html; charset=utf-8"} ".css" {"text/css"} ".js" {"application/javascript"} ".jpg" {"image/jpeg"} ".png" {"image/png"} ".webp" {"image/webp"} ".svg" {"image/svg+xml"} default {"application/octet-stream"} }
      if ($ext -eq ".webp" -or $ext -eq ".jpg" -or $ext -eq ".png" -or $ext -eq ".svg") {
        $ctx.Response.Headers.Add("Cache-Control", "public, max-age=31536000, immutable")
      } elseif ($ext -eq ".html") {
        $ctx.Response.Headers.Add("Cache-Control", "no-cache")
      }
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes,0,$bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $b = [Text.Encoding]::UTF8.GetBytes("404 - Not found")
      $ctx.Response.OutputStream.Write($b,0,$b.Length)
    }
    $ctx.Response.Close()
  }
} finally { if ($listener -and $listener.IsListening) { $listener.Stop() } }
