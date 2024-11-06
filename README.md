# LogAnalyzer
LogAnalyzer — это инструмент для логирования в приложениях на стороне backend, использующий декораторы для записи логов с различными транспортами (консоль, SQLite). Логи собираются во время выполнения методов, которые помечены специальным декоратором, а затем выгружаются в формате XML для последующего анализа с использованием Power BI.

## Основные возможности:
Декораторы для логирования: Методами, помеченными декораторами, автоматически записываются логи с параметрами времени выполнения, уникальными идентификаторами (UID), а также информацией о вызывающем методе.
Мульти-транспортное логирование: Логи могут быть записаны как в консоль, так и в базу данных SQLite для длительного хранения и анализа.
Экспорт в XML: Логи выгружаются в формате XML, что позволяет их импортировать и анализировать с помощью Power BI или других инструментов для визуализации и анализа данных.
Анализ в Power BI: Данные, собранные через логирование, могут быть использованы для создания отчетов и визуализаций в Power BI.
