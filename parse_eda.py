import json
import sys

nb = json.load(open(r'd:\Coding\Computer Science\Personal Project\TR-TU-NH-N-T-O-NG-D-NG-\Analysis\Analysis_Code\notebooks\main\Main_EDA.ipynb', encoding='utf-8'))
out = []
for c in nb['cells']:
    if c['cell_type'] == 'markdown':
        out.append('[MD] ' + ''.join(c['source']))
    else:
        lines = ''.join(c['source']).split('\n')
        out.extend(['[CODE_COMMENT] ' + l for l in lines if l.strip().startswith('#') or 'plt.title' in l or 'sns.' in l])

with open('eda_details.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
