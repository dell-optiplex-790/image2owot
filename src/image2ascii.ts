type RGBA = [
    R: number,
    G: number,
    B: number,
    A: number
]

type Resolution = [
    width: number,
    height: number
]

const dataTypes = {
    COLOR: 0,
    NEWLINE: 1
}

function createCanvas(w: number, h: number): HTMLCanvasElement {
    var el = document.createElement('canvas');
    el.width = w, el.height = h, el.style.display = 'none'
    return el;
}

function importImage(img: HTMLImageElement): Promise<{res: Resolution, inCTX: CanvasRenderingContext2D}> {return new Promise(async (resolve)=>{
    var input = createCanvas(img.naturalWidth, img.naturalHeight);
    var inCTX = <CanvasRenderingContext2D>input.getContext('2d');
    inCTX.drawImage(img, 0, 0);
    resolve({res: [img.naturalWidth, img.naturalHeight], inCTX})
})}

function average(rgbArray: Array<RGBA>): RGBA {
    var rgb: Array<number> = [], tmp: number = 0;
    for(var i = 0; i < 3; i++) {
        for(var j = 0; j < rgbArray.length; j++) {
            tmp += rgbArray[j][i];
        }
        rgb.push(Math.floor(tmp / rgbArray.length));
        tmp = 0;
    }
    return <RGBA>rgb;
}

function rgbToInt(r: number, g: number, b: number, a?: number): number {
    if(r == 0 && g == 0 && b == 0) {
        return rgbToInt(1, 1, 1); // bugfix
    } else {
        return ((r << 16) + (g << 8)) | b;
    }
}


async function generate(img: HTMLImageElement, _downscale: number): Promise<{img: Array<number>, res: Resolution}> {
    var {res, inCTX} = await importImage(img);
    var [w, h] = res;
    var $img: Array<number> = [];
    var downscale = _downscale;
    if(_downscale > 18) {
        downscale = 1;
        while((w / downscale) > _downscale) {
            downscale++;
        }
    }
    for(var y = 0; y < h; y += 2 * downscale) {
        for(var x = 0; x < w; x += downscale) {
            var dat: Array<number[]> = [], dat2: Array<number[]> = [];
            for(var dx = 0; dx < downscale; dx++) {
                for(var dy = 0; dy < Math.floor(downscale / 2); dy++) {
                    dat.push(Array.from((inCTX.getImageData(x + dx, y + dy, 1, 1)).data));
                    dat2.push(Array.from(inCTX.getImageData(x + dx, y + dy + Math.floor(downscale / 2), 1, 1).data));
                }
            }

            var avgDat1 = average(<RGBA[]>dat.filter((e: Array<number>) => e.length > 0));
            var avgDat2 = average(<RGBA[]>dat2.filter((e: Array<number>) => e.length > 0));
            
            $img.push(
                // data type: color
                dataTypes.COLOR,
                // foreground
                rgbToInt(...<RGBA>avgDat1),
                // background
                rgbToInt(...<RGBA>(avgDat2.length > 0 ? avgDat2 : [0, 0, 0]))
            );
        }
        $img.push(
            // data type: newline
            dataTypes.NEWLINE,
            // unused1
            0,
            // unused2
            0
        );
    }
    return {img: $img, res};
};

export {dataTypes, generate};

