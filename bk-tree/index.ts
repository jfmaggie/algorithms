import levenshtein from "fast-levenshtein";
import fs from "fs";

export interface BKNode {
  children: {
    [key: number]: BKNode;
  };
  value: string;
}

interface Matches {
  [key: string]: number;
}

export class BKNode {
  constructor(value: string) {
    this.children = {};
    this.value = value;
  }

  add(value: string) {
    // get distance between value and this.value
    // children has key === distance, recurse
    // if not, add new node to children
    const distance = levenshtein.get(value, this.value);
    if (distance in this.children) {
      this.children[distance].add(value);
    } else {
      this.children[distance] = new BKNode(value);
    }
  }

  find(value: string, matches: Matches, maxDistance: number): Matches {
    const distance = levenshtein.get(value, this.value);
    if (distance <= maxDistance) {
      matches[this.value] = distance;
    }

    const range: number[] = [];
    for (let i = distance - maxDistance; i <= distance + maxDistance; i++) {
      range.push(i);
    }

    range.forEach(num => {
      if (num in this.children) {
        this.children[num].find(value, matches, maxDistance);
      }
    });

    return matches;
  }
}

export interface BKTree {
  root: BKNode | null;
}

export class BKTree {
  constructor() {
    this.root = null;
  }

  add(value: string) {
    if (this.root == null) {
      this.root = new BKNode(value);
    } else {
      this.root.add(value);
    }
  }

  find(value: string, maxDistance: number = 2) {
    if (this.root == null) {
      return {};
    }

    return this.root.find(value, {}, maxDistance);
  }
}

// build testing tree
const words = fs
  .readFileSync("/usr/share/dict/words")
  .toString()
  .split("\n");

export const tree = new BKTree();
words.forEach(word => tree.add(word));
