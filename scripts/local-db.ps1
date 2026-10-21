param([ValidateSet('start', 'stop')][string]$Action = 'start')
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$bin = 'C:\Program Files\PostgreSQL\18\bin'
$local = Join-Path $root '.local'
$data = Join-Path $local 'postgres'
$passwordFile = Join-Path $local 'postgres-password.txt'
if (!(Test-Path (Join-Path $bin 'pg_ctl.exe'))) { throw 'Install PostgreSQL 18 or adjust the bin path in this script.' }
if ($Action -eq 'stop') {
  & "$bin\pg_ctl.exe" -D $data -m fast -w stop
  exit $LASTEXITCODE
}
New-Item -ItemType Directory -Force -Path $local | Out-Null
if (!(Test-Path $passwordFile)) {
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
  [IO.File]::WriteAllText($passwordFile, [Convert]::ToHexString($bytes))
}
$password = [IO.File]::ReadAllText($passwordFile).Trim()
if (!(Test-Path (Join-Path $data 'PG_VERSION'))) {
  & "$bin\initdb.exe" -D $data -U community_dev --auth=scram-sha-256 --pwfile=$passwordFile --encoding=UTF8 --locale=C
  if ($LASTEXITCODE -ne 0) { throw 'Database initialization failed.' }
}
& "$bin\pg_ctl.exe" -D $data status *> $null
if ($LASTEXITCODE -ne 0) {
  $log = Join-Path $local 'postgres.log'
  $process = Start-Process -FilePath "$bin\pg_ctl.exe" -ArgumentList "-D `"$data`" -l `"$log`" -o `"-h 127.0.0.1 -p 55432`" -w start" -WindowStyle Hidden -PassThru
  # Wait for pg_ctl only; Start-Process -Wait also waits for the long-running server.
  $process.WaitForExit()
  if ($process.ExitCode -ne 0) { throw 'Database startup failed. See .local/postgres.log.' }
}
$previousPassword = $env:PGPASSWORD
try {
  $env:PGPASSWORD = $password
  foreach ($name in @('discord_community', 'discord_community_test')) {
    $exists = & "$bin\psql.exe" -h 127.0.0.1 -p 55432 -U community_dev -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$name'"
    if ($LASTEXITCODE -ne 0) { throw 'Could not authenticate to the development database.' }
    if ([string]$exists -notmatch '1') {
      & "$bin\createdb.exe" -h 127.0.0.1 -p 55432 -U community_dev $name
      if ($LASTEXITCODE -ne 0) { throw "Could not create $name." }
    }
  }
} finally { $env:PGPASSWORD = $previousPassword }
$envFile = Join-Path $root '.env'
$content = if (Test-Path $envFile) { [IO.File]::ReadAllText($envFile) } else { [IO.File]::ReadAllText((Join-Path $root '.env.example')) }
if (!(Test-Path (Join-Path $local 'env-before-local-db.txt'))) { [IO.File]::WriteAllText((Join-Path $local 'env-before-local-db.txt'), $content) }
$line = 'DATABASE_URL="postgresql://community_dev:' + $password + '@127.0.0.1:55432/discord_community"'
if ($content -match '(?m)^DATABASE_URL=.*$') { $content = [regex]::Replace($content, '(?m)^DATABASE_URL=.*$', $line) } else { $content += "`n$line`n" }
[IO.File]::WriteAllText($envFile, $content)
Write-Host 'Development PostgreSQL is ready on 127.0.0.1:55432. DATABASE_URL updated; other settings preserved.'
