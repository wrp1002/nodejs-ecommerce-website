import glob
import webbrowser

files = glob.glob(input("Directory:") + "*")

for i in files:
	webbrowser.open("http://localhost:5000/add?imgpath=" + i)