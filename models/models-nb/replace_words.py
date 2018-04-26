import os


afile = open('words-to-replace.csv','r')
lines = afile.readlines()


#create a dictionary of words mapped to their replacement
aDict = {}
for line in lines:
	line = line.strip('\n').split(',')
	aDict[line[0]] = line[1]

keys = aDict.keys()


#iterates through directory and replaces words in documents
count=0
newspapers = os.listdir("accessible")
numFound = 0
for newspaper in newspapers:
	if newspaper != "TheCharlestonMercury-incomplete" or newspaper != 'VincennesCourant':
		contents = os.listdir("accessible/" + newspaper)	

		for content in contents:
			if content[0] == "1":
				subcontents = os.listdir("accessible/" + newspaper + "/"  + content)
				for afile in subcontents:
					if "txt" in afile:
						f = open("accessible/" + newspaper + "/" +  content + "/" + afile)
						allwords = f.read()
						f.close()
						words = allwords.split()
						newstring = ''
						exists = False
						for word in words:
							if word in keys:
								exists = True
								if '\n' in word:
									newstring += ' ' + aDict[word] + '\n'
								else:
									newstring += ' ' + aDict[word]
							else:
								newstring += ' ' + word	
						a = open("accessible/" + newspaper + "/" + content + "/" + afile, "w")
						a.write(newstring)
						a.close()


