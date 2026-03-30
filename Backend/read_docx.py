import zipfile
import xml.etree.ElementTree as ET

doc = zipfile.ZipFile('road_hazard_backend_architecture (4).docx')
xml_content = doc.read('word/document.xml')
tree = ET.XML(xml_content)
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
text = [node.text for node in tree.findall('.//w:t', ns) if node.text]

with open('extracted_doc.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(text))
print("Extraction complete.")
