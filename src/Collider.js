import { utils } from "./utils.js";
const EPSILON = 0.02;
export class Collider{
    constructor(drawable){
        this.drawable = drawable;
        this.useSix = false;
    }

    useSixColliders(){
        this.useSix = true;
        this.directionalColliders = {
            up : [
                this.boundaries[0]-EPSILON,
                this.boundaries[1],
                this.boundaries[2]-EPSILON,
                this.boundaries[3]+EPSILON,
                this.boundaries[1]-EPSILON,
                this.boundaries[5]+EPSILON],
            down : [
                this.boundaries[0]-EPSILON,
                this.boundaries[4]+EPSILON,
                this.boundaries[2]-EPSILON,
                this.boundaries[3]+EPSILON,
                this.boundaries[4],
                this.boundaries[5]+EPSILON],
            front : [
                this.boundaries[0]-EPSILON,
                this.boundaries[1]-EPSILON,
                this.boundaries[2],
                this.boundaries[3]+EPSILON,
                this.boundaries[4]+EPSILON,
                this.boundaries[2]-EPSILON],
            back : [
                this.boundaries[0]-EPSILON,
                this.boundaries[1]-EPSILON,
                this.boundaries[5]+EPSILON,
                this.boundaries[3]+EPSILON,
                this.boundaries[4]+EPSILON,
                this.boundaries[5]],
            left : [
                this.boundaries[3]+EPSILON,
                this.boundaries[1]-EPSILON,
                this.boundaries[2]-EPSILON,
                this.boundaries[3],
                this.boundaries[4]+EPSILON,
                this.boundaries[2]+EPSILON],
            right : [
                this.boundaries[0],
                this.boundaries[1]-EPSILON,
                this.boundaries[2]-EPSILON,
                this.boundaries[0]-EPSILON,
                this.boundaries[4]+EPSILON,
                this.boundaries[2]+EPSILON]
        };
    }

    isCollidingWith(objects){
        let boundaryList = objects
            .filter((i)=>i.collider!=this)
            .map((i) => i.collider);
        for (let i of boundaryList)
            if (this.colliderCheck(this.boundaries, i.boundaries)){
                    return i;
                }
        return null;
    }

    colliderCheck(myBoundaries, otherBoundaries){
        return ((myBoundaries[3] <= otherBoundaries[0] && myBoundaries[0] >= otherBoundaries[3]) && 
        (myBoundaries[4] <= otherBoundaries[1] && myBoundaries[1] >= otherBoundaries[4]) &&
        (myBoundaries[5] <= otherBoundaries[2] && myBoundaries[2] >= otherBoundaries[5]));
    }

    sixColliders(objects){ //method returning an array of 6 boolean
        let boundaryList = objects
            .filter((i)=>i.collider!=this)
            .map((i) => i.collider);

        let result = {
            front: false,
            back: false,
            up: false,
            down: false,
            left: false,
            right: false
        };

        for (let i of boundaryList){
            if(this.colliderCheck(this.directionalColliders.down, i.boundaries)) result.down = true;
            if(this.colliderCheck(this.directionalColliders.up, i.boundaries)) result.up = true;
            if(this.colliderCheck(this.directionalColliders.front, i.boundaries)) result.front = true;
            if(this.colliderCheck(this.directionalColliders.back, i.boundaries)) result.back = true;
            if(this.colliderCheck(this.directionalColliders.left, i.boundaries)) result.left = true;
            if(this.colliderCheck(this.directionalColliders.right, i.boundaries)) result.right = true;
        }
        return result;
    }

    isInside(point){
        return ((this.boundaries[3] <= point[0] && this.boundaries[0] >= point[0]) && 
                (this.boundaries[4] <= point[1] && this.boundaries[1] >= point[1]) &&
                (this.boundaries[5] <= point[2] && this.boundaries[2] >= point[2]));
    }

    draw(camera){
        this.renderer.draw(camera);
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
        this.boundariesOriginal = this.drawable.mesh.boundaries;
        
        this.worldMatrix = this.drawable.getWorldWithoutRotation();
        let topCorner = utils.multiplyMatrixVector(this.worldMatrix, this.boundariesOriginal.slice(0,3).concat([1]));
        let bottomCorner = utils.multiplyMatrixVector(this.worldMatrix, this.boundariesOriginal.slice(3,6).concat([1]));
        this.boundaries = topCorner.slice(0,3).concat(bottomCorner.slice(0,3));
        if(this.useSix) this.useSixColliders();
    }


}