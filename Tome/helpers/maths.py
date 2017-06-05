def median(aList):
    ct = len(aList)
    if (ct % 2 == 0):
        i1 = ct // 2
        i2 = i1 - 1
        return (aList[i1] + aList[i2])/2
    else:
        return aList[ct//2]
