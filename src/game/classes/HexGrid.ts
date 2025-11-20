export class HexGrid {
    tileSize: number;
    halfWidth: number;

    constructor(tileSize: number) {
        this.tileSize = tileSize;
        this.halfWidth = tileSize / 2.0 * 0.866025404;
    }

    tileCenter([tileX, tileY]: [number, number]): [number, number] {
        if ((tileY & 1) == 0) {
            return [tileX * this.halfWidth * 2.0, tileY * 0.75 * this.tileSize];
        } else {
            return [(tileX + 0.5) * this.halfWidth * 2.0, tileY * 0.75 * this.tileSize];
        }
    }

    tileToWorld(p: [number, number]): [number, number] {
        return this.tileCenter(p)
    }

    worldToTile([worldX, worldY]: [number, number]): [number, number] {
        return this.axialToOffset(this.pixelToAxial([worldX, worldY]))
    }


// reference this for math https://www.redblobgames.com/grids/hexagons/#rounding

    cubeToAxial([q,r,s]: [number, number, number]): [number, number] {
        return [q, r]
    }

    axialToCube([q, r]: [number, number]): [number, number, number] {
        return [q, r, -q - r]
    }

    axialToOffset([q, r]: [number, number]): [number, number] {
        let parity = r&1;
        return [q + (r - parity) / 2.0, r]
    }

    cubeRound([q, r, s]: [number, number, number]): [number, number, number] {
        let q_ = Math.round(q);
        let r_ = Math.round(r);
        let s_ = Math.round(s);

        let qd = Math.abs(q_ - q)
        let rd = Math.abs(r_ - r)
        let sd = Math.abs(s_ - s)

        if (qd > rd && qd > sd) {
            q_ = -r_-s_
        } else if (rd > sd) {
            r_ = -q_-s_
        } else {
            s_ = -q_-r_
        }

        return [q_, r_, s_]
    }

    axialRound([q, r]: [number, number]): [number, number] {
        return this.cubeToAxial(this.cubeRound(this.axialToCube([q, r])));
    }

    pixelToAxial([x, y]: [number, number]): [number, number] {
        let x_ = x / this.tileSize * 2.0;
        let y_ = y / this.tileSize * 2.0;

        let q  = 0.577350269 * x_ - 1.0 / 3.0 * y_
        let r  = 2.0 / 3.0 * y_
        return this.axialRound([q, r])
    }
}