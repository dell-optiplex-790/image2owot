import { generate, dataTypes } from './image2ascii';
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

(function() {
    // the thing
    var url = prompt('Image URL?', 'https://i.imgur.com/vuPAZ7S.jpeg');
    if(!url) {
        return alert('Cancelled.');
    }
    const img = document.createElement('img');
    img.src = url;
    img.style.display = 'none';
    img.crossOrigin = 'anonymous';
    img.addEventListener('load', async function() {
        api_chat_send(`${atob(amBadge)} using ${atob(pName)} from ${atob(author)} to paste an image... you can find the project at https://github.com/${atob(author)}/${atob(pName)}`)
        const { img: dat } = await generate(img, 120);
        for(let i = 0; i < dat.length; i += 3) {
            if(dat[i] == dataTypes.COLOR) {
                writeChar(
                    '▀',
                    false,
                    dat[i + 1],
                    false,
                    0,
                    dat[i + 2]
                );
            } else if(dat[i] == dataTypes.NEWLINE) {
                writeChar('\n');
            }
            await wait(15);
        }
    })
    img.addEventListener('error', function() {
        img.remove();
        alert('Invalid URL.');
    })
    document.body.appendChild(img);
})();