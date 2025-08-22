document.addEventListener('DOMContentLoaded', () => {

    let selectedSticker = null;

    const stage = new Konva.Stage({
        container: 'skateCanvasContainer',
        width: 120,
        height: 450,
    });

    const mainLayer = new Konva.Layer();
    stage.add(mainLayer);
    const holesLayer = new Konva.Layer();
    stage.add(holesLayer);

    const saveButton = document.getElementById('saveButton');
    const colorPicker = document.getElementById('backgroundColorPicker');
    const stickerOptionsBar = document.getElementById('sticker-options');
    const buttonsLayers = stickerOptionsBar.querySelectorAll('button');
    const textDelete = stickerOptionsBar.querySelectorAll('div');

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
    }, {
        name: 'Adesivo 6',
        url: 'assets/sticker6.png'
    }];

    const clipShape = new Konva.Rect({
        x: 0,
        y: 0,
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
        listening: true,
    });
    clippableGroup.add(backgroundRect);

    function createTruckHoles() {
        const holeRadius = 3;
        const truckOffsetFromCenter = 110;
        const holeSpacingX = 20;
        const holeSpacingY = 35;

        const centerX = stage.width() / 2;
        const centerY = stage.height() / 2;

        const truckPositions = [
            { x: centerX, y: centerY - truckOffsetFromCenter },
            { x: centerX, y: centerY + truckOffsetFromCenter }
        ];

        const holeProps = {
            radius: holeRadius,
            fill: 'black',
            listening: false,
            stroke: '#cccccc',
            strokeWidth: 2
        };

        truckPositions.forEach(pos => {
            const holesData = [
                { x: pos.x - holeSpacingX / 2, y: pos.y - holeSpacingY / 2 },
                { x: pos.x + holeSpacingX / 2, y: pos.y - holeSpacingY / 2 },
                { x: pos.x - holeSpacingX / 2, y: pos.y + holeSpacingY / 2 },
                { x: pos.x + holeSpacingX / 2, y: pos.y + holeSpacingY / 2 }
            ];

            holesData.forEach(data => {
                const hole = new Konva.Circle({ ...holeProps, ...data });
                holesLayer.add(hole);
            });
        });
    }


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
        canvasContainer.addEventListener('dragover', (e) => { e.preventDefault(); });

        canvasContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            stage.setPointersPositions(e);

            const imageUrl = e.dataTransfer.getData('text/plain');
            if (!imageUrl) return;

            const dropPosition = stage.getPointerPosition();

            Konva.Image.fromURL(imageUrl, (stickerImage) => {
                stickerImage.setAttrs({
                    x: dropPosition.x, y: dropPosition.y,
                    scaleX: 0.3, scaleY: 0.3,
                    draggable: true, name: 'sticker',
                });
                stickerImage.offsetX(stickerImage.width() / 2);
                stickerImage.offsetY(stickerImage.height() / 2);

                clippableGroup.add(stickerImage);
                transformer.nodes([stickerImage]);
                selectedSticker = stickerImage;

                buttonsLayers.forEach(button => {
                    button.style.display = 'flex'
                });

                textDelete.forEach(text => {
                    text.style.display = 'none'
                })
            });
        });
    }


    function setupSelection() {
        transformer = new Konva.Transformer({
            nodes: [], keepRatio: true,
            anchorStroke: '#0094ff', anchorFill: '#ffffff',
            anchorSize: 8, borderStroke: '#0094ff',
            borderDash: [3, 3]
        });

        mainLayer.add(transformer);
        transformer.moveToTop();

        clippableGroup.on('click tap', function (e) {
            if (e.target.hasName('sticker')) {
                transformer.nodes([e.target]);
                selectedSticker = e.target;
                buttonsLayers.forEach(button => {
                    button.style.display = 'flex'
                });
                textDelete.forEach(text => {
                    text.style.display = 'none'
                });
            } else {
                transformer.nodes([]);
                selectedSticker = null;
                buttonsLayers.forEach(button => {
                    button.style.display = 'none'
                });
                textDelete.forEach(text => {
                    text.style.display = 'flex'
                })
            }
        });

        stage.on('click tap', function (e) {
            if (e.target === stage) {
                transformer.nodes([]);
                selectedSticker = null;
                buttonsLayers.forEach(button => {
                    button.style.display = 'none'
                });
                textDelete.forEach(text => {
                    text.style.display = 'flex'
                })
            }
        });
    }

    function setupLayeringControls() {
        document.getElementById('moveUpBtn').addEventListener('click', () => {
            if (selectedSticker) {
                selectedSticker.moveUp();
            }
        });
        document.getElementById('moveDownBtn').addEventListener('click', () => {
            if (selectedSticker) {
                if (selectedSticker.getZIndex() > 1) {
                    selectedSticker.moveDown();
                }
            }
        });
        document.getElementById('moveToTopBtn').addEventListener('click', () => {
            if (selectedSticker) {
                selectedSticker.moveToTop();
            }
        });
        document.getElementById('moveToBottomBtn').addEventListener('click', () => {
            if (selectedSticker) {
                selectedSticker.setZIndex(1);
            }
        });
    }

    function setupDeleteListener() {
        window.addEventListener('keydown', (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedSticker) {
                transformer.nodes([]);
                selectedSticker.destroy();
                selectedSticker = null;
                buttonsLayers.forEach(button => {
                    button.style.display = 'none'
                });
                textDelete.forEach(text => {
                    text.style.display = 'flex'
                });
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
            transformer.nodes([]);
            selectedSticker = null;
            stickerOptionsBar.style.display = 'none';

            const dataURL = stage.toDataURL({ pixelRatio: 2 });
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
    createTruckHoles();
    setupDeleteListener();
    setupLayeringControls();
});