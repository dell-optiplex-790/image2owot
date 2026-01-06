import { generate, dataTypes, rgbToInt } from './image2ascii';
import { amBadge, author, pName } from './constants';

declare function writeChar(
    char: string,
    doNotMoveCursor?: boolean,
    color?: number,
    noNewline?: boolean,
    undoCursorOffset?: number,
    bgColor?: number,
    doBold?: boolean,
    doItalic?: boolean,
    doUnderline?: boolean,
    doStrikethrough?: boolean
): void;

declare function api_chat_send(
    message: string,
    opts?: Record<string, any>
)

function wait(time: number) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    })
}

function avg(color1: number, color2: number) {
    const data1 = [
        (color1 >> 16) & 0xFF,
        (color1 >> 8) & 0xFF,
        color1 & 0xFF,
    ], data2 = [
        (color2 >> 16) & 0xFF,
        (color2 >> 8) & 0xFF,
        color2 & 0xFF,
    ], dataA: Array<number> = [];
    for(let i = 0; i < data1.length; i++) {
        dataA.push(Math.floor((data1[i] + data2[i]) / 2));
    }
    return rgbToInt(...<[number, number, number]>dataA);
}

(function() {
    // the thing
    var url = prompt('Image URL?', 'https://i.imgur.com/vuPAZ7S.jpeg');
    if(!url) {
        return alert('Cancelled.');
    }
    var bypass = confirm('Bypass background restrictions? (this will degrade image quality!) [ok=yes,cancel=no]');
    const img = document.createElement('img');
    img.src = url;
    img.style.display = 'none';
    img.crossOrigin = 'anonymous';
    img.addEventListener('load', async function() {
        api_chat_send(`${atob(amBadge)} using ${atob(pName)} from ${atob(author)} to paste an image... you can find the project at https://github.com/${atob(author)}/${atob(pName)}`)
        const { img: dat } = await generate(img, 120);
        for(let i = 0; i < dat.length; i += 3) {
            if(dat[i] == dataTypes.COLOR) {
                if(!bypass) {
                    writeChar(
                        '▀',
                        false,
                        dat[i + 1],
                        false,
                        0,
                        dat[i + 2]
                    );
                } else {
                    writeChar(
                        '█',
                        false,
                        avg(dat[i + 1], dat[i + 2]), // average
                    );
                }
            } else if(dat[i] == dataTypes.NEWLINE) {
                writeChar('\n');
            }
            await wait(20);
        }
    })
    img.addEventListener('error', function() {
        img.remove();
        alert('Invalid URL.');
    })
    document.body.appendChild(img);
})();