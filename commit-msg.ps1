$nodePath = (Get-Command node).Source
& $nodePath ".git\hooks\commit-msg.mjs" @args
exit $LASTEXITCODE