
#!/usr/bin/env bash
set -euo pipefail
AEP="${1:-nasij_scene.aep}"
COMP="${2:-NASIJ}"
/Applications/Adobe\ After\ Effects*/aerender -project "$AEP" -comp "$COMP" -OMtemplate "High Quality"
