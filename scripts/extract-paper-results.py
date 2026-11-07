"""Extract the active result tables, excluding commented drafts, from the supplied paper.

Usage: python3 scripts/extract-paper-results.py /path/to/RAL-mainV10.tex
The paper explicitly marks controller and skill numbers as generated examples.
"""
import json
import re
import sys
from pathlib import Path

source = Path(sys.argv[1])
text = '\n'.join(line for line in source.read_text().splitlines() if not line.lstrip().startswith('%'))

def clean(cell):
    cell = re.sub(r'\\multirow\{[^}]*\}\{[^}]*\}\{([^}]*)\}', r'\1', cell)
    cell = re.sub(r'\\(?:textbf|text|emph|values)\{([^}]*)\}', r'\1', cell)
    return cell.replace('\\pm', ' ± ').replace('\\_', ' ').replace('\\%', '%').replace('\\ ', ' ').replace('$', '').strip()

tables = {}
for block in re.findall(r'\\begin\{table\*?\}(.*?)\\end\{table\*?\}', text, re.S):
    label = re.search(r'\\label\{tab:([^}]+)\}', block)
    body = re.search(r'\\begin\{tabular\}.*?\\midrule(.*?)\\bottomrule', block, re.S)
    if not label or not body:
        continue
    rows = []
    for line in body.group(1).split('\\\\'):
        line = line.replace('\\midrule', '').strip()
        if not line:
            continue
        cells = [clean(cell) for cell in line.split('&')]
        if cells[0] == '' and rows:
            cells[0] = rows[-1][0]
        rows.append(cells)
    tables[label.group(1)] = rows

result = {'source': source.name, 'controllerDataStatus': 'Generated numerical examples, not measured robot outcomes', 'perceptionDataStatus': 'Supplied post-augmentation development-split results', 'tables': tables}
Path('src/content/manuscript-results.json').write_text(json.dumps(result, indent=2) + '\n')
print('Extracted', ', '.join(f'{key}: {len(rows)} rows' for key, rows in tables.items()))
