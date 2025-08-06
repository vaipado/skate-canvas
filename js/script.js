document.addEventListener('DOMContentLoaded', () => {

    const stage = new Konva.Stage({
        container: 'skateCanvasContainer',
        width: 120,
        height: 450,
    });

    const mainLayer = new Konva.Layer();
    stage.add(mainLayer);

    const draggableItems = document.querySelectorAll('.draggable-item');
    const saveButton = document.getElementById('saveButton');
    const colorPicker = document.getElementById('backgroundColorPicker');

    const clippableGroup = new Konva.Group();
    mainLayer.add(clippableGroup);

    let backgroundRect;

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

    function setupDragAndDrop() {
        draggableItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const imageUrl = e.target.closest('.draggable-item').dataset.image;
                e.dataTransfer.setData('text/plain', imageUrl);
            });
        });

        stage.container().addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        stage.container().addEventListener('drop', (e) => {
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
            });
        });
    }

    function setupSelection() {
        const transformer = new Konva.Transformer({ nodes: [] });
        mainLayer.add(transformer);

        clippableGroup.on('click tap', function (e) {
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
            const transformer = stage.findOne('Transformer');
            if (transformer) {
                transformer.nodes([]);
            }
            const dataURL = stage.toDataURL({ pixelRatio: 2 });
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'arte-skate-konva.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    setupColorPicker();
    setupDragAndDrop();
    setupSelection();
    setupSaveButton();
});