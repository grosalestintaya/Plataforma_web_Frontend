#!/usr/bin/env bash
# ============================================================
#  optimize-images.sh — PNG, JPEG, GIF → WebP
#  Uso:
#    ./optimize-images.sh                  # carpeta actual
#    ./optimize-images.sh /ruta/carpeta
#    ./optimize-images.sh /ruta -q 85
#    ./optimize-images.sh /ruta -r         # recursivo
#    ./optimize-images.sh /ruta --dry-run
# ============================================================

set -euo pipefail
export LC_ALL=C

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

TARGET_DIR="."
QUALITY=82
RECURSIVE=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -q|--quality)   QUALITY="$2"; shift 2 ;;
    -r|--recursive) RECURSIVE=true; shift ;;
    --dry-run)      DRY_RUN=true; shift ;;
    -h|--help)
      echo -e "${BOLD}Uso:${RESET} $0 [directorio] [opciones]"
      echo "  -q, --quality N    Calidad 0-100 (default: 82)"
      echo "  -r, --recursive    Procesar subcarpetas"
      echo "  --dry-run          Simular sin convertir"
      exit 0 ;;
    *)
      if [[ -d "$1" ]]; then TARGET_DIR="$1"
      else echo -e "${RED}Directorio no encontrado: $1${RESET}" && exit 1
      fi
      shift ;;
  esac
done

TARGET_DIR="$(realpath "$TARGET_DIR")"
BACKUP_DIR="$TARGET_DIR/backup"

# ─── Dependencias ───────────────────────────────────────────
check_deps() {
  local missing=()
  command -v cwebp    &>/dev/null || missing+=("cwebp    → sudo apt install -y webp")
  command -v img2webp &>/dev/null || missing+=("img2webp → sudo apt install -y webp")
  command -v convert  &>/dev/null || missing+=("convert  → sudo apt install -y imagemagick")

  if [[ ${#missing[@]} -gt 0 ]]; then
    echo -e "${RED}${BOLD}Dependencias faltantes:${RESET}"
    for dep in "${missing[@]}"; do
      echo -e "  ${RED}✗${RESET} $dep"
    done
    exit 1
  fi
}

# ─── Helpers ────────────────────────────────────────────────
fmt_size() {
  local bytes=$1
  if   (( bytes >= 1048576 )); then printf "%.2f MB" "$(echo "scale=2; $bytes/1048576" | bc)"
  elif (( bytes >= 1024    )); then printf "%.1f KB"  "$(echo "scale=1; $bytes/1024"    | bc)"
  else printf "%d B" "$bytes"
  fi
}

pct_saved() {
  local orig=$1 new=$2
  (( orig == 0 )) && echo "0" && return
  echo $(( (orig - new) * 100 / orig ))
}

badge() {
  local pct=$1
  if   (( pct >= 60 )); then echo -e "${GREEN}▼ ${pct}%${RESET}"
  elif (( pct >= 20 )); then echo -e "${YELLOW}▼ ${pct}%${RESET}"
  else                       echo -e "${RED}▼ ${pct}%${RESET}"
  fi
}

# ─── Convertir GIF animado ──────────────────────────────────
convert_gif() {
  local src="$1"
  local webp_out="$2"
  local tmp_dir; tmp_dir=$(mktemp -d /tmp/webp_frames_XXXXXX)

  # Extraer frames como PNG
  convert "$src" "$tmp_dir/frame_%04d.png" &>/dev/null

  local frames=("$tmp_dir"/frame_*.png)

  if [[ ${#frames[@]} -eq 0 ]]; then
    rm -rf "$tmp_dir"
    return 1
  fi

  if [[ ${#frames[@]} -eq 1 ]]; then
    # GIF estático — usar cwebp directamente
    cwebp -q "$QUALITY" -mt "${frames[0]}" -o "$webp_out" &>/dev/null
  else
    # GIF animado — ensamblar frames con img2webp
    img2webp -q "$QUALITY" "${frames[@]}" -o "$webp_out" &>/dev/null
  fi

  rm -rf "$tmp_dir"
}

# ─── Convertir un archivo ───────────────────────────────────
convert_file() {
  local src="$1"
  local ext_lower="${src##*.}"; ext_lower="${ext_lower,,}"
  local webp_out="${src%.*}.webp"
  local orig_size; orig_size=$(stat -c%s "$src")

  if $DRY_RUN; then
    echo -e "  ${CYAN}[dry-run]${RESET} → $(basename "$webp_out")" >&2
    echo "0"; return
  fi

  if [[ "$ext_lower" == "gif" ]]; then
    convert_gif "$src" "$webp_out" || true
  else
    cwebp -q "$QUALITY" -mt "$src" -o "$webp_out" &>/dev/null
  fi

  if [[ ! -f "$webp_out" ]]; then
    echo -e "  ${RED}✗ Error al convertir${RESET}" >&2
    echo "0"; return
  fi

  local webp_size; webp_size=$(stat -c%s "$webp_out")
  local pct; pct=$(pct_saved "$orig_size" "$webp_size")
  local saved=$(( orig_size - webp_size ))

  echo -e "  ${GREEN}✓${RESET} $(fmt_size "$orig_size") → $(fmt_size "$webp_size") $(badge "$pct")" >&2

  local rel_path="${src#$TARGET_DIR/}"
  local backup_dest="$BACKUP_DIR/$rel_path"
  mkdir -p "$(dirname "$backup_dest")"
  mv "$src" "$backup_dest"
  echo -e "  ${CYAN}↪ backup/${rel_path}${RESET}" >&2

  echo "$saved"
}

# ─── Main ───────────────────────────────────────────────────
main() {
  check_deps

  echo ""
  echo -e "${BOLD}╔══════════════════════════════════════╗${RESET}"
  echo -e "${BOLD}║       Image Optimizer — WebP         ║${RESET}"
  echo -e "${BOLD}╚══════════════════════════════════════╝${RESET}"
  echo ""
  echo -e "  Directorio : ${CYAN}$TARGET_DIR${RESET}"
  echo -e "  Calidad    : ${CYAN}$QUALITY${RESET}"
  echo -e "  Recursivo  : ${CYAN}$RECURSIVE${RESET}"
  echo -e "  Backup     : ${CYAN}$BACKUP_DIR${RESET}"
  $DRY_RUN && echo -e "  ${YELLOW}── DRY-RUN: no se realizarán cambios ──${RESET}"
  echo ""

  local find_opts=(-maxdepth 1)
  $RECURSIVE && find_opts=()

  mapfile -t files < <(find "$TARGET_DIR" "${find_opts[@]}" \
    -not -path "$BACKUP_DIR/*" \
    \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" \) \
    -type f | sort)

  local total_files=${#files[@]}

  if (( total_files == 0 )); then
    echo -e "${YELLOW}No se encontraron imágenes en: $TARGET_DIR${RESET}"
    exit 0
  fi

  echo -e "${BOLD}${total_files} imagen(es) encontradas${RESET}"
  echo -e "$(printf '─%.0s' {1..42})"

  local grand_saved=0
  local processed=0
  local failed=0

  for src in "${files[@]}"; do
    echo ""
    echo -e "${BOLD}$(basename "$src")${RESET}"
    local saved
    saved=$(convert_file "$src")
    if [[ "$saved" -gt 0 ]]; then
      grand_saved=$(( grand_saved + saved ))
      (( processed++ )) || true
    else
      (( failed++ )) || true
    fi
  done

  echo ""
  echo -e "$(printf '═%.0s' {1..42})"
  echo -e "${BOLD}Resumen${RESET}"
  echo -e "  Procesadas  : ${GREEN}$processed${RESET}"
  (( failed > 0 )) && echo -e "  Con error   : ${RED}$failed${RESET}"
  echo -e "  Ahorro total: ${GREEN}${BOLD}$(fmt_size $grand_saved)${RESET}"
  $DRY_RUN || echo -e "  Backup en   : ${CYAN}$BACKUP_DIR${RESET}"
  echo ""
}

main