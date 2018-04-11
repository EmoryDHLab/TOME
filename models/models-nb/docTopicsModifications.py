afile = open("Colored_Conventions_docTopics.txt", "r")
newfile = open("Colored_Conventions_docTopics.csv", "w")
lines = afile.readlines()
count = 0
for line in lines:
	newline = ""
	splitline = line.split("), ")
	for split in splitline:
		topic = split.split(", ")
		newline += topic[0].strip("(").strip("[") + "," +  topic[1].strip("\n").strip("]").strip(")") + ","
	newfile.write(newline[1:len(newline)-1] + "\n")
newfile.close()
afile.close()	

	
