document.addEventListener('DOMContentLoaded', () => {

    const stage = new Konva.Stage({
        container: 'skateCanvasContainer',
        width: 120,
        height: 450,
    });

    const mainLayer = new Konva.Layer();
    stage.add(mainLayer);

    const saveButton = document.getElementById('saveButton');
    const colorPicker = document.getElementById('backgroundColorPicker');

    const clippableGroup = new Konva.Group();
    mainLayer.add(clippableGroup);

    let backgroundRect;
    let transformer;

    const imageBank = [{
        name: 'Adesivo 1',
        url: 'assets/sticker1.png'
    }, {
        name: 'Adesivo 2',
        url: 'assets/sticker2.png'
    }, {
        name: 'Adesivo 3',
        url: 'assets/sticker3.png'
    }, {
        name: 'Adesivo 4',
        url: 'assets/sticker4.png'
    }, {
        name: 'Adesivo 5',
        url: 'assets/sticker5.png'
    }
    ];

    const clipShape = new Konva.Rect({
        x: (stage.width()) / 2,
        y: (stage.height()) / 2,
        width: 120,
        height: 450,
        cornerRadius: 200,
    });

    clippableGroup.clipFunc((ctx) => {
        clipShape._sceneFunc(ctx);
    });

    backgroundRect = new Konva.Rect({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: colorPicker.value,
        listening: false,
    });
    clippableGroup.add(backgroundRect);

    function populateImageBank() {
        const container = document.getElementById('imageBankContainer');
        if (!container) return;

        imageBank.forEach(sticker => {
            const divItem = document.createElement('div');
            divItem.className = 'draggable-item';
            divItem.setAttribute('draggable', 'true');
            divItem.setAttribute('data-image', sticker.url);

            const imgItem = document.createElement('img');
            imgItem.src = sticker.url;
            imgItem.alt = sticker.name;

            divItem.appendChild(imgItem);
            container.appendChild(divItem);
        });
    }

    function setupDragAndDrop() {
        const draggableItems = document.querySelectorAll('.draggable-item');

        draggableItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const imageUrl = e.currentTarget.dataset.image;
                e.dataTransfer.setData('text/plain', imageUrl);
            });
        });

        const canvasContainer = stage.container();

        canvasContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        canvasContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            stage.setPointersPositions(e);

            const imageUrl = e.dataTransfer.getData('text/plain');
            if (!imageUrl) return;

            const dropPosition = stage.getPointerPosition();

            Konva.Image.fromURL(imageUrl, (stickerImage) => {
                stickerImage.setAttrs({
                    x: dropPosition.x,
                    y: dropPosition.y,
                    scaleX: 0.5,
                    scaleY: 0.5,
                    draggable: true,
                    name: 'sticker',
                });
                stickerImage.offsetX(stickerImage.width() / 2);
                stickerImage.offsetY(stickerImage.height() / 2);

                clippableGroup.add(stickerImage);
                stickerImage.moveToTop();

                transformer.nodes([stickerImage]);
            });
        });
    }

    function setupSelection() {
        transformer = new Konva.Transformer({
            nodes: [],
            keepRatio: true,
            anchorStroke: '#0094ff',
            anchorFill: '#ffffff',
            anchorSize: 8,
            borderStroke: '#0094ff',
            borderDash: [3, 3]
        });

        mainLayer.add(transformer);
        transformer.moveToTop();

        clippableGroup.on('click tap', function (e) {
            if (e.target === clippableGroup) {
                transformer.nodes([]);
                return;
            }
            if (e.target.hasName('sticker')) {
                transformer.nodes([e.target]);
            } else {
                transformer.nodes([]);
            }
        });

        stage.on('click tap', function (e) {
            if (e.target === stage) {
                transformer.nodes([]);
            }
        });
    }

    function setupColorPicker() {
        colorPicker.addEventListener('input', (e) => {
            const newColor = e.target.value;
            if (backgroundRect) {
                backgroundRect.fill(newColor);
            }
        });
    }

    function setupSaveButton() {
        saveButton.addEventListener('click', () => {
            if (transformer) {
                transformer.nodes([]);
            }
            const dataURL = stage.toDataURL({
                pixelRatio: 2
            });
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'arte-skate-konva.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    populateImageBank();
    setupColorPicker();
    setupDragAndDrop();
    setupSelection();
    setupSaveButton();
});