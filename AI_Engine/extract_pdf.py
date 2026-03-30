import sys
import subprocess

try:
    import PyPDF2
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyPDF2"])
    import PyPDF2

def extract():
    pdf_path = r"c:\Users\shlok\Downloads\TeamInnovex\AI_Analysis.pdf"
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
    out_path = r"c:\Users\shlok\Downloads\TeamInnovex\AI_Analysis_real.txt"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Extracted {len(text)} characters successfully!")

if __name__ == "__main__":
    extract()
