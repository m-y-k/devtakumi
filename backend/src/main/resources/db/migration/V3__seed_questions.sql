-- Seed practice questions for key early classes
INSERT INTO questions (id, class_session_id, title, difficulty, statement_markdown, constraints, examples, starter_code_java, test_cases, tags, order_index) VALUES
('e0000001-0001-4000-8000-000000000001', 'd0000001-0003-4000-8000-000000000001', 'Celsius to Fahrenheit Converter', 'EASY',
'Write a Java program that converts a given temperature in Celsius to Fahrenheit. The formula is: `F = (C * 9/5) + 32`.\n\n### Input\nRead Celsius from stdin as a double.\n\n### Output\nPrint the Fahrenheit value as a double.',
'["Celsius temperature is between -273.15 and 1000.0"]',
'[{"input": "0.0", "output": "32.0", "explanation": "0 Celsius is 32 Fahrenheit"}, {"input": "100.0", "output": "212.0", "explanation": "100 Celsius is boiling point"}]',
'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        double celsius = sc.nextDouble();\n        double fahrenheit = (celsius * 9.0 / 5.0) + 32.0;\n        System.out.println(fahrenheit);\n    }\n}',
'[{"input": "0.0\\n", "expected_output": "32.0\\n", "hidden": false}, {"input": "100.0\\n", "expected_output": "212.0\\n", "hidden": false}, {"input": "-40.0\\n", "expected_output": "-40.0\\n", "hidden": false}, {"input": "37.0\\n", "expected_output": "98.6\\n", "hidden": true}, {"input": "-10.0\\n", "expected_output": "14.0\\n", "hidden": true}, {"input": "25.5\\n", "expected_output": "77.9\\n", "hidden": true}]',
'["variables", "data-types"]', 1);

INSERT INTO questions (id, class_session_id, title, difficulty, statement_markdown, constraints, examples, starter_code_java, test_cases, tags, order_index) VALUES
('e0000001-0001-4000-8000-000000000002', 'd0000001-0005-4000-8000-000000000001', 'Area of Circle', 'EASY',
'Calculate the area of a circle given its radius. Use `3.14159` for Pi.\n\n### Input\nRead radius from stdin as a double.\n\n### Output\nPrint the calculated area.',
'["Radius is between 0.0 and 1000.0"]',
'[{"input": "1.0", "output": "3.14159", "explanation": "Area is Pi * 1 * 1"}, {"input": "2.0", "output": "12.56636", "explanation": "Area is Pi * 2 * 2"}]',
'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        double radius = sc.nextDouble();\n        double area = 3.14159 * radius * radius;\n        System.out.println(area);\n    }\n}',
'[{"input": "1.0\\n", "expected_output": "3.14159\\n", "hidden": false}, {"input": "2.0\\n", "expected_output": "12.56636\\n", "hidden": false}, {"input": "5.0\\n", "expected_output": "78.53975\\n", "hidden": false}, {"input": "0.0\\n", "expected_output": "0.0\\n", "hidden": true}, {"input": "10.0\\n", "expected_output": "314.159\\n", "hidden": true}, {"input": "7.5\\n", "expected_output": "176.7144375\\n", "hidden": true}]',
'["operators", "math"]', 1);

INSERT INTO questions (id, class_session_id, title, difficulty, statement_markdown, constraints, examples, starter_code_java, test_cases, tags, order_index) VALUES
('e0000001-0001-4000-8000-000000000003', 'd0000001-0006-4000-8000-000000000001', 'Check Odd or Even', 'EASY',
'Write a program that checks if a given integer is odd or even. Print `EVEN` or `ODD`.\n\n### Input\nRead an integer N.\n\n### Output\nPrint EVEN or ODD.',
'["N is between -100000 and 100000"]',
'[{"input": "4", "output": "EVEN", "explanation": "4 is divisible by 2"}, {"input": "7", "output": "ODD", "explanation": "7 is not divisible by 2"}]',
'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        if (n % 2 == 0) {\n            System.out.println("EVEN");\n        } else {\n            System.out.println("ODD");\n        }\n    }\n}',
'[{"input": "4\\n", "expected_output": "EVEN\\n", "hidden": false}, {"input": "7\\n", "expected_output": "ODD\\n", "hidden": false}, {"input": "0\\n", "expected_output": "EVEN\\n", "hidden": false}, {"input": "-5\\n", "expected_output": "ODD\\n", "hidden": true}, {"input": "1002\\n", "expected_output": "EVEN\\n", "hidden": true}, {"input": "-1003\\n", "expected_output": "ODD\\n", "hidden": true}]',
'["conditionals"]', 1);

INSERT INTO questions (id, class_session_id, title, difficulty, statement_markdown, constraints, examples, starter_code_java, test_cases, tags, order_index) VALUES
('e0000001-0001-4000-8000-000000000004', 'd0000001-0006-4000-8000-000000000001', 'Leap Year Checker', 'EASY',
'Determine if a given year is a leap year. A year is a leap year if it is divisible by 4, except for end-of-century years, which must be divisible by 400. Print `LEAP` or `NOT LEAP`.\n\n### Input\nRead an integer representing the year.\n\n### Output\nPrint LEAP or NOT LEAP.',
'["Year is between 1 and 9999"]',
'[{"input": "2000", "output": "LEAP", "explanation": "2000 is divisible by 400"}, {"input": "1900", "output": "NOT LEAP", "explanation": "1900 is divisible by 100 but not 400"}]',
'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int year = sc.nextInt();\n        boolean isLeap = false;\n        if (year % 4 == 0) {\n            if (year % 100 == 0) {\n                isLeap = (year % 400 == 0);\n            } else {\n                isLeap = true;\n            }\n        }\n        if (isLeap) {\n            System.out.println("LEAP");\n        } else {\n            System.out.println("NOT LEAP");\n        }\n    }\n}',
'[{"input": "2000\\n", "expected_output": "LEAP\\n", "hidden": false}, {"input": "1900\\n", "expected_output": "NOT LEAP\\n", "hidden": false}, {"input": "2024\\n", "expected_output": "LEAP\\n", "hidden": false}, {"input": "2023\\n", "expected_output": "NOT LEAP\\n", "hidden": true}, {"input": "1600\\n", "expected_output": "LEAP\\n", "hidden": true}, {"input": "1700\\n", "expected_output": "NOT LEAP\\n", "hidden": true}]',
'["conditionals"]', 2);

INSERT INTO questions (id, class_session_id, title, difficulty, statement_markdown, constraints, examples, starter_code_java, test_cases, tags, order_index) VALUES
('e0000001-0001-4000-8000-000000000005', 'd0000001-0011-4000-8000-000000000001', 'Sum of N Numbers', 'EASY',
'Compute the sum of the first N natural numbers using a while loop.\n\n### Input\nRead an integer N.\n\n### Output\nPrint the sum of natural numbers from 1 to N.',
'["N is between 0 and 10000"]',
'[{"input": "5", "output": "15", "explanation": "1+2+3+4+5 = 15"}, {"input": "10", "output": "55", "explanation": "Sum from 1 to 10 is 55"}]',
'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int sum = 0;\n        int i = 1;\n        while (i <= n) {\n            sum += i;\n            i++;\n        }\n        System.out.println(sum);\n    }\n}',
'[{"input": "5\\n", "expected_output": "15\\n", "hidden": false}, {"input": "10\\n", "expected_output": "55\\n", "hidden": false}, {"input": "1\\n", "expected_output": "1\\n", "hidden": false}, {"input": "0\\n", "expected_output": "0\\n", "hidden": true}, {"input": "100\\n", "expected_output": "5050\\n", "hidden": true}, {"input": "50\\n", "expected_output": "1275\\n", "hidden": true}]',
'["loops", "while-loop"]', 1);

INSERT INTO questions (id, class_session_id, title, difficulty, statement_markdown, constraints, examples, starter_code_java, test_cases, tags, order_index) VALUES
('e0000001-0001-4000-8000-000000000006', 'd0000001-0012-4000-8000-000000000001', 'Factorial of a Number', 'EASY',
'Calculate the factorial of a positive integer N using a for loop.\n\n### Input\nRead an integer N.\n\n### Output\nPrint the factorial value.',
'["N is between 0 and 12"]',
'[{"input": "5", "output": "120", "explanation": "5! = 5*4*3*2*1 = 120"}, {"input": "3", "output": "6", "explanation": "3! = 3*2*1 = 6"}]',
'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long fact = 1;\n        for (int i = 1; i <= n; i++) {\n            fact *= i;\n        }\n        System.out.println(fact);\n    }\n}',
'[{"input": "5\\n", "expected_output": "120\\n", "hidden": false}, {"input": "3\\n", "expected_output": "6\\n", "hidden": false}, {"input": "0\\n", "expected_output": "1\\n", "hidden": false}, {"input": "1\\n", "expected_output": "1\\n", "hidden": true}, {"input": "7\\n", "expected_output": "5040\\n", "hidden": true}, {"input": "10\\n", "expected_output": "3628800\\n", "hidden": true}]',
'["loops", "for-loop"]', 1);

INSERT INTO questions (id, class_session_id, title, difficulty, statement_markdown, constraints, examples, starter_code_java, test_cases, tags, order_index) VALUES
('e0000001-0001-4000-8000-000000000007', 'd0000001-0012-4000-8000-000000000001', 'Nth Fibonacci Number', 'MEDIUM',
'Print the Nth Fibonacci number, where F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2).\n\n### Input\nRead an integer N.\n\n### Output\nPrint the Nth Fibonacci number.',
'["N is between 0 and 45"]',
'[{"input": "6", "output": "8", "explanation": "Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8..."}, {"input": "0", "output": "0", "explanation": "0th Fibonacci is 0"}]',
'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        if (n == 0) {\n            System.out.println(0);\n            return;\n        }\n        int a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            int temp = a + b;\n            a = b;\n            b = temp;\n        }\n        System.out.println(b);\n    }\n}',
'[{"input": "6\\n", "expected_output": "8\\n", "hidden": false}, {"input": "0\\n", "expected_output": "0\\n", "hidden": false}, {"input": "1\\n", "expected_output": "1\\n", "hidden": false}, {"input": "2\\n", "expected_output": "1\\n", "hidden": true}, {"input": "10\\n", "expected_output": "55\\n", "hidden": true}, {"input": "15\\n", "expected_output": "610\\n", "hidden": true}]',
'["loops", "fibonacci"]', 2);

INSERT INTO questions (id, class_session_id, title, difficulty, statement_markdown, constraints, examples, starter_code_java, test_cases, tags, order_index) VALUES
('e0000001-0001-4000-8000-000000000008', 'd0000001-0018-4000-8000-000000000001', 'Sum of Array Elements', 'EASY',
'Given an array of size N, print the sum of all elements.\n\n### Input\nThe first line of input contains N. The second line contains N space-separated integers.\n\n### Output\nPrint the sum of all array elements.',
'["N is between 1 and 1000", "Array elements are integers"]',
'[{"input": "5\\n1 2 3 4 5", "output": "15", "explanation": "1+2+3+4+5 = 15"}, {"input": "3\\n10 -2 5", "output": "13", "explanation": "10 - 2 + 5 = 13"}]',
'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int sum = 0;\n        for (int i = 0; i < n; i++) {\n            sum += sc.nextInt();\n        }\n        System.out.println(sum);\n    }\n}',
'[{"input": "5\\n1 2 3 4 5\\n", "expected_output": "15\\n", "hidden": false}, {"input": "3\\n10 -2 5\\n", "expected_output": "13\\n", "hidden": false}, {"input": "1\\n9\\n", "expected_output": "9\\n", "hidden": false}, {"input": "4\\n0 0 0 0\\n", "expected_output": "0\\n", "hidden": true}, {"input": "5\\n-1 -2 -3 -4 -5\\n", "expected_output": "-15\\n", "hidden": true}, {"input": "6\\n100 200 300 400 500 600\\n", "expected_output": "2100\\n", "hidden": true}]',
'["arrays"]', 1);

INSERT INTO questions (id, class_session_id, title, difficulty, statement_markdown, constraints, examples, starter_code_java, test_cases, tags, order_index) VALUES
('e0000001-0001-4000-8000-000000000009', 'd0000001-0024-4000-8000-000000000001', 'Linear Search Element Index', 'EASY',
'Perform linear search to find the index of a key K in an array of size N. If the element is found, print its first 0-indexed position. If not, print -1.\n\n### Input\nThe first line has: size N and key K. The second line contains N space-separated integers.\n\n### Output\nPrint the 0-indexed position of K, or -1.',
'["N is between 1 and 1000"]',
'[{"input": "5 3\\n1 2 3 4 5", "output": "2", "explanation": "3 is located at index 2"}, {"input": "4 10\\n1 5 7 9", "output": "-1", "explanation": "10 is not in the array"}]',
'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int k = sc.nextInt();\n        int foundIndex = -1;\n        for (int i = 0; i < n; i++) {\n            int num = sc.nextInt();\n            if (num == k && foundIndex == -1) {\n                foundIndex = i;\n            }\n        }\n        System.out.println(foundIndex);\n    }\n}',
'[{"input": "5 3\\n1 2 3 4 5\\n", "expected_output": "2\\n", "hidden": false}, {"input": "4 10\\n1 5 7 9\\n", "expected_output": "-1\\n", "hidden": false}, {"input": "3 1\\n1 2 3\\n", "expected_output": "0\\n", "hidden": false}, {"input": "5 5\\n1 2 3 4 5\\n", "expected_output": "4\\n", "hidden": true}, {"input": "6 7\\n2 4 6 7 7 8\\n", "expected_output": "3\\n", "hidden": true}, {"input": "2 9\\n9 9\\n", "expected_output": "0\\n", "hidden": true}]',
'["arrays", "searching", "linear-search"]', 1);

INSERT INTO questions (id, class_session_id, title, difficulty, statement_markdown, constraints, examples, starter_code_java, test_cases, tags, order_index) VALUES
('e0000001-0001-4000-8000-000000000010', 'd0000001-0026-4000-8000-000000000001', 'Binary Search Implementation', 'EASY',
'Perform binary search to find the index of a key K in a sorted array of size N. If found, print its 0-indexed position. If not, print -1.\n\n### Input\nThe first line has: size N and key K. The second line contains N sorted space-separated integers.\n\n### Output\nPrint the 0-indexed position of K, or -1.',
'["N is between 1 and 10000", "Array is sorted in ascending order"]',
'[{"input": "5 30\\n10 20 30 40 50", "output": "2", "explanation": "30 is at index 2"}, {"input": "4 15\\n10 20 30 40", "output": "-1", "explanation": "15 is not present"}]',
'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int k = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) {\n            arr[i] = sc.nextInt();\n        }\n        \n        int low = 0, high = n - 1;\n        int ans = -1;\n        while (low <= high) {\n            int mid = low + (high - low) / 2;\n            if (arr[mid] == k) {\n                ans = mid;\n                break;\n            } else if (arr[mid] < k) {\n                low = mid + 1;\n            } else {\n                high = mid - 1;\n            }\n        }\n        System.out.println(ans);\n    }\n}',
'[{"input": "5 30\\n10 20 30 40 50\\n", "expected_output": "2\\n", "hidden": false}, {"input": "4 15\\n10 20 30 40\\n", "expected_output": "-1\\n", "hidden": false}, {"input": "1 10\\n10\\n", "expected_output": "0\\n", "hidden": false}, {"input": "6 60\\n10 20 30 40 50 60\\n", "expected_output": "5\\n", "hidden": true}, {"input": "3 5\\n1 5 9\\n", "expected_output": "1\\n", "hidden": true}, {"input": "5 1\\n3 5 7 9 11\\n", "expected_output": "-1\\n", "hidden": true}]',
'["arrays", "searching", "binary-search"]', 1);
