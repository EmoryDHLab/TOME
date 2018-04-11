afile = open("Colored_Conventions.txt", "r")
lines = afile.readlines()
afile.close()
newfile = open("Colored_Conventions.csv", "w")
for line in lines:
	newline = line.split(",")[0][1:] + ","
	pairs = line.split(")")
	for i in range(len(pairs)-2):
		if i == 0:
			important = pairs[i].split("[")[1]
			important2 = important.split(", ")
			newline += important2[0][3:len(important2[0])-1].strip(",") + "," + important2[1] + ","
		else:
			try:
				important = pairs[i].split(", ")
				#print(newline)
				#print(important)
				newline += important[1][3:len(important[1]) - 1].strip(",") + "," + important[2] + ","
			except:
				print("Error in topic " + line.split(",")[0][1:])
	newfile.write(newline[:-1] + "\n")
newfile.close()
	

