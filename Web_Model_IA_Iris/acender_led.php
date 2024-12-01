<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Controle LED</title>
</head>
<body>
    <h1>Controle LED</h1>
    <button onclick="controlLed('on')">Acender LED</button>
    <button onclick="controlLed('off')">Apagar LED</button>

    <script>
        function controlLed(state) {
            fetch(`http://10.224.2.42/${state}`)
                .then(response => console.log(`LED ${state}`))
                .catch(error => console.error('Erro:', error));
        }
    </script>
</body>
</html>