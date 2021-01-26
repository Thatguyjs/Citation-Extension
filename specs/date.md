## 32-bit Date format


### General Information
 - If any section contains an invalid value, assume it is 0


### Date Format
 - Month
	- 4 bits
	- Values 1 to 12
 - Year
	- 12 bits
	- Offset since 1970
 - Day
	- 5 bits
	- Values 1 to 31
 - Hour
	- 5 bits
	- Values 0 to 23
 - Minute
	- 6 bits
	- Values 0 to 59

<pre><code>
 0               1               2               3
 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7  
+-------+-----------------------+---------+---------+-----------+
| Month |          Year         |   Day   |   Hour  |   Minute  |
|  (4)  |          (12)         |   (5)   |   (5)   |    (6)    |
+-------+-----------------------+---------+---------+-----------+
</code></pre>
