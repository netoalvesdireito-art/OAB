# Questoes extraidas das provas 40 a 45

Este diretório reúne a extração consolidada das 80 questões de cada prova.

## Arquivos publicados

- `resumo.json`: resumo por prova com a contagem final das questões extraídas.
- `todas-as-provas.json.gz.b64.part01` a `part06`: conteúdo consolidado de todas as provas, compactado em `gzip`, convertido para `base64` e dividido em partes.
- `todas-as-provas.json.gz.sha256.txt`: checksum SHA-256 do arquivo `.gz` reconstruído.

## Como reconstruir `todas-as-provas.json`

No PowerShell, dentro deste diretório:

```powershell
$base64 = (Get-ChildItem .\todas-as-provas.json.gz.b64.part* | Sort-Object Name | ForEach-Object { Get-Content -Raw $_ }) -join ''
[IO.File]::WriteAllBytes('.\todas-as-provas.json.gz', [Convert]::FromBase64String($base64))

$input = [IO.File]::OpenRead('.\todas-as-provas.json.gz')
$gzip = [IO.Compression.GzipStream]::new($input, [IO.Compression.CompressionMode]::Decompress)
$output = [IO.File]::Create('.\todas-as-provas.json')
$gzip.CopyTo($output)
$output.Dispose()
$gzip.Dispose()
$input.Dispose()
```

Depois disso, o arquivo `todas-as-provas.json` conterá o consolidado completo das provas 40, 41, 42, 43, 44 e 45.
