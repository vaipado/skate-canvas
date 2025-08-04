document.addEventListener('DOMContentLoaded', () => {

    const canvas = new fabric.Canvas('skateCanvas', {
        width: 800,
        height: 600
    });

    const draggableItems = document.querySelectorAll('.draggable-item');
    const saveButton = document.getElementById('saveButton');
    const colorPicker = document.getElementById('backgroundColorPicker');
    
    let stickerHolderGroup;
    let backgroundRect;

    function setupSkateAndClipping() {
        fabric.loadSVGFromURL('assets/skate-shape.svg', (objects, options) => {
            const skateDeck = fabric.util.groupSVGElements(objects, options);

            skateDeck.set({
                left: canvas.width / 2,
                top: canvas.height / 2,
                originX: 'center',
                originY: 'center',
                scaleX: 1.5,
                scaleY: 1.5,
                selectable: false,
                evented: false,
                absolutePositioned: true
            });

            canvas.add(skateDeck);
            canvas.sendToBack(skateDeck);

            backgroundRect = new fabric.Rect({
                width: skateDeck.getScaledWidth(),
                height: skateDeck.getScaledHeight(),
                fill: colorPicker.value,
                originX: 'center',
                originY: 'center',
                selectable: false,
                evented: false
            });

            stickerHolderGroup = new fabric.Group([backgroundRect], {
                left: skateDeck.left,
                top: skateDeck.top,
                originX: 'center',
                originY: 'center',
                clipPath: skateDeck,
                selectable: false,
                evented: false,
                width: skateDeck.getScaledWidth(),
                height: skateDeck.getScaledHeight()
            });

            canvas.add(stickerHolderGroup);
            canvas.renderAll();
        });
    }

    function setupDragAndDrop() {
        draggableItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const imageUrl = e.target.closest('.draggable-item').dataset.image;
                e.dataTransfer.setData('text/plain', imageUrl);
            });
        });

        canvas.upperCanvasEl.addEventListener('dragover', (e) => { e.preventDefault(); });

        canvas.upperCanvasEl.addEventListener('drop', (e) => {
            e.preventDefault();
            const imageUrl = e.dataTransfer.getData('text/plain');

            if (!imageUrl || !stickerHolderGroup) return;

            const img = new Image();
            img.src = imageUrl;
            img.onload = () => {
                const fabricImage = new fabric.Image(img, {
                    left: 0,
                    top: 0,
                    originX: 'center',
                    originY: 'center',
                    scaleX: 0.5,
                    scaleY: 0.5,
                    selectable: true,
                    hasControls: true,
                    hasBorders: true
                });

                stickerHolderGroup.add(fabricImage);
                canvas.bringToFront(stickerHolderGroup);
                canvas.setActiveObject(fabricImage);
                canvas.renderAll();
            };
        });
    }

    function setupColorPicker() {
        colorPicker.addEventListener('input', (e) => {
            const newColor = e.target.value;
            if (backgroundRect) {
                backgroundRect.set('fill', newColor);
                canvas.renderAll();
            }
        });
    }

    function setupSaveButton() {
        saveButton.addEventListener('click', () => {
            canvas.discardActiveObject();
            canvas.renderAll();

            const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });

            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'arte-skate.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    setupSkateAndClipping();
    setupDragAndDrop();
    setupColorPicker();
    setupSaveButton();
});