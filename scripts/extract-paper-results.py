"""Extract active tables, prompts, and interface examples from the supplied LaTeX.
Usage: python3 scripts/extract-paper-results.py /path/to/RAL-mainV11.tex
"""
import json
import re
import sys
from pathlib import Path
source = Path(sys.argv[1])
text = '\n'.join(line for line in source.read_text().splitlines() if not line.lstrip().startswith('%'))

def clean(cell):
    cell = cell.replace(r'\&', ' AND ').replace(r'\!', '').replace(r'\;', ' ')
    cell = re.sub(r'\\multirow\{[^}]*\}\{[^}]*\}\{([^}]*)\}', r'\1', cell)
    cell = re.sub(r'\\(?:textbf|text|emph|values|mathrm|small)\{([^}]*)\}', r'\1', cell)
    cell = cell.replace(r'\pm', ' ± ').replace(r'\_', ' ').replace(r'\%', '%').replace(r'\ ', ' ').replace('$', '').replace(' AND ', ' & ')
    return re.sub(r'\s+', ' ', cell).strip()

tables = {}
for block in re.findall(r'\\begin\{table\*?\}(.*?)\\end\{table\*?\}', text, re.S):
    label = re.search(r'\\label\{tab:([^}]+)\}', block)
    body = re.search(r'\\begin\{tabular\}.*?\\midrule(.*?)\\bottomrule', block, re.S)
    if not label or not body: continue
    rows = []
    for line in body.group(1).split('\\\\'):
        line = line.replace('\\midrule', '').strip()
        if not line: continue
        cells = [clean(cell) for cell in re.split(r'(?<!\\)&', line)]
        if not cells[0] and rows: cells[0] = rows[-1][0]
        rows.append(cells)
    tables[label.group(1)] = rows

listings = {}
for options, body in re.findall(r'\\begin\{lstlisting\}\[(.*?)\]\s*\n(.*?)\\end\{lstlisting\}', text, re.S):
    label = re.search(r'label=\{lst:([^}]+)\}', options)
    if label: listings[label.group(1)] = body.strip()

interfaces = {key: json.loads(listings[key]) for key in ['worldstate_packet', 'reasoning_response', 'action_response']}
interfaces['source'] = source.name
Path('src/content/paper-interfaces.json').write_text(json.dumps(interfaces, indent=2) + '\n')
Path('src/content/manuscript-results.json').write_text(json.dumps({'source': source.name, 'controllerDataStatus': 'Physical-trial summaries reported in V11', 'perceptionDataStatus': 'Post-augmentation development split', 'tables': tables}, indent=2) + '\n')
prompts = [('System instruction', 'system_prompt'), ('Available skills', 'skill_descriptions'), ('Reasoning and selection', 'reasoning_prompt'), ('Action formatting', 'action_prompt')]
Path('public/content/system-prompts.txt').write_text('\n\n'.join(f'## {title}\n[source: {source.name}]\n{listings[key]}' for title,key in prompts) + '\n')
print('Extracted tables:', {key: len(rows) for key,rows in tables.items()})
print('Extracted', len(prompts), 'prompts and', len(interfaces)-1, 'JSON examples')
