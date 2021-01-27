def genPairs(n):
    for i in range(0, n):
        for j in range(i+1, n):
            yield (i, j)
for p in genPairs(5):
    print(p) 