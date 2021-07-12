import { utils } from "./utils";

export class Collider{
    constructor(drawable){
        this.drawable = drawable;
        this.boundaries = drawable.mesh.boundaries;
        /*this.corners = [
            [this.boundaries[0], this.boundaries[2], this.boundaries[4]],
            [this.boundaries[1], this.boundaries[2], this.boundaries[4]],
            [this.boundaries[0], this.boundaries[3], this.boundaries[4]],
            [this.boundaries[1], this.boundaries[3], this.boundaries[4]],
            [this.boundaries[0], this.boundaries[2], this.boundaries[5]],
            [this.boundaries[1], this.boundaries[2], this.boundaries[5]],
            [this.boundaries[0], this.boundaries[3], this.boundaries[5]],
            [this.boundaries[1], this.boundaries[3], this.boundaries[5]]
        ]; */

        this.updateCollider();
    }

    isColliding(objects){
        let boundaryList = objects.map((i) => i.collider.boundaries);
        for (i in boundaryList)
            if ((i.minX <= b.maxX && i.maxX >= b.minX) && (i.minY <= b.maxY && i.maxY >= b.minY) && (i.minZ <= b.maxZ && a.maxZ >= b.minZ))

        return false;
    }

    updateCollider(){
        this.worldMatrix = this.drawable.worldMatrix;
        let topCorner = utils.multiplyMatrixVector(this.worldMatrix, [this.boundaries[0], this.boundaries[2], this.boundaries[4]]);
        let bottomCorner = utils.multiplyMatrixVector(this.worldMatrix, [this.boundaries[1], this.boundaries[3], this.boundaries[5]]);
        this.boundaries = [topCorner[0], bottomCorner[0], topCorner[1], bottomCorner[1], topCorner[2], bottomCorner[2]];
    }
}