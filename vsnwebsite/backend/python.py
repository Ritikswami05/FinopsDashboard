def store_in_mysql(data):
    try:
        # Connect without selecting database to ensure DB exists
        print("Connecting to MySQL server...")
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD
        )
        cursor = conn.cursor()
        print("Connected successfully.")

        # Create database if it doesn't exist
        print(f"Ensuring database '{MYSQL_DATABASE}' exists...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DATABASE}")
        conn.commit()

        # Reconnect with the database selected
        conn.database = MYSQL_DATABASE
        print(f"Switched to database '{MYSQL_DATABASE}'.")

        # Create table if not exists
        print(f"Creating table `{MYSQL_TABLE}` if it doesn't exist...")
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS `{MYSQL_TABLE}` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                resource_group VARCHAR(255),
                vm_name VARCHAR(255),
                max_cpu FLOAT,
                avg_cpu FLOAT,
                max_memory_bytes FLOAT,
                avg_memory_bytes FLOAT,
                max_memory_percent FLOAT,
                avg_memory_percent FLOAT
            )
        """)
        conn.commit()
        print(f"Table `{MYSQL_TABLE}` is ready.")

        insert_query = f"""
            INSERT INTO `{MYSQL_TABLE}` (
                resource_group, vm_name,
                max_cpu, avg_cpu,
                max_memory_bytes, avg_memory_bytes,
                max_memory_percent, avg_memory_percent
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        for row in data:
            print(f"Inserting row: {row}")
            cursor.execute(insert_query, (
                row["Resource Group"], row["VM Name"],
                row.get("Maximum_Percentage_CPU"), row.get("Average_Percentage_CPU"),
                row.get("Maximum_Available_Memory_Bytes"), row.get("Average_Available_Memory_Bytes"),
                row.get("Maximum_Available_Memory_Percentage"), row.get("Average_Available_Memory_Percentage")
            ))

        conn.commit()
        print(f"\n✅ All metrics successfully saved to MySQL table '{MYSQL_TABLE}'.")

    except mysql.connector.Error as err:
        print("❌ MySQL Error:", err)
    except Exception as e:
        print("❌ General Error:", e)
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
            print("MySQL connection closed.")
