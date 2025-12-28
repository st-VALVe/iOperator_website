#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import requests
import json
import sys
import codecs

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

r = requests.get('https://dns.google/resolve?name=dev.ioperator.ai&type=5')
d = r.json()
print('DNS for dev.ioperator.ai:')
for ans in d.get('Answer', []):
    print(f'  {ans.get("data", "")}')

