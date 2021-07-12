import { utils } from "./utils.js";

export class Collider{
    constructor(drawable){
        this.drawable = drawable;
    }

    isColliding(objects){
        let boundaryList = objects.map((i) => i.collider.boundaries);
        for (let i of boundaryList)
            if ((this.boundaries[3] <= i[0] && this.boundaries[0] >= i[3]) && 
                (this.boundaries[4] <= i[1] && this.boundaries[1] >= i[4]) &&
                (this.boundaries[5] <= i[2] && this.boundaries[2] >= i[5]))
                    return true;
        return false;
    }

    isInside(point){
        return ((this.boundaries[3] <= point[0] && this.boundaries[0] >= point[0]) && 
                (this.boundaries[4] <= point[1] && this.boundaries[1] >= point[1]) &&
                (this.boundaries[5] <= point[2] && this.boundaries[2] >= point[2]));
    }

    isCollidingWithRay(ray, rayOrigin){
        let dirfracx = 1.0 / ray[0];
        let dirfracy = 1.0 / ray[1];
        let dirfracz = 1.0 / ray[2];
        
        let t1 = (this.boundaries[3] - rayOrigin[0])*dirfracx;
        let t2 = (this.boundaries[0] - rayOrigin[0])*dirfracx;
        let t3 = (this.boundaries[4] - rayOrigin[1])*dirfracy;
        let t4 = (this.boundaries[1] - rayOrigin[1])*dirfracy;
        let t5 = (this.boundaries[5] - rayOrigin[2])*dirfracz;
        let t6 = (this.boundaries[2] - rayOrigin[2])*dirfracz;

        let tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
        let tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));
        let t;
        if (tmax < 0){
            t = tmax;
            return null;
        }

        if (tmin > tmax){
            t = tmax;
            return null;
        }

        t = tmin;
        return t;
    }

    updateCollider(){
        this.boundaries = this.drawable.mesh.boundaries;
        
        this.worldMatrix = this.drawable.worldMatrix;
        let topCorner = utils.multiplyMatrixVector(this.worldMatrix, this.boundaries.slice(0,3).concat([1]));
        let bottomCorner = utils.multiplyMatrixVector(this.worldMatrix, this.boundaries.slice(3,6).concat([1]));
        this.boundaries = topCorner.slice(0,3).concat(bottomCorner.slice(0,3));
    }


}