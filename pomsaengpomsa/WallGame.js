
class WallGame {
  constructor(brickTexture) {
    this.wallScale = 0.0;
    this.wallSpeed = 1.0 / 600.0;
    this.myCircle = new WallFeature(0.9, color(255, 100, 100));
    this.brickTexture = brickTexture;
  }

  draw() {
    this.drawSkyGradient();
    
    let centerY = height / 2;
    let horizonWidthOffset = width * 0.05;
    let horizonFullWidth = horizonWidthOffset * 2;
    
    // Draw Ground
    fill(34, 139, 34);
    noStroke();
    beginShape();
    vertex(width / 2 - horizonWidthOffset, centerY); 
    vertex(width / 2 + horizonWidthOffset, centerY); 
    vertex(width, height);                     
    vertex(0, height);                         
    endShape(CLOSE);

    // Wall Logic
    let wallBottomY = centerY + (height - centerY) * this.wallScale;
    let wallWidth = map(wallBottomY, centerY, height, horizonFullWidth, width);
    let wallHeight = wallWidth * (4.0 / 6.0); 
    let wallY = wallBottomY - wallHeight;
    
    // Access texture
    if (this.brickTexture) {
      image(this.brickTexture, width / 2 - wallWidth / 2, wallY, wallWidth, wallHeight);
    } else {
      fill(200, 100, 50);
      rect(width / 2 - wallWidth / 2, wallY, wallWidth, wallHeight);
    }

    let wallCenterX = width / 2;
    let wallCenterY = wallY + wallHeight / 2;
    this.myCircle.display(wallCenterX, wallCenterY, wallWidth, wallHeight);

    this.wallScale += this.wallSpeed;
    
    if (this.wallScale > 1.0) {
      this.wallScale = 0.0; 
    }
  }

  drawSkyGradient() {
    let c3 = color(135, 206, 235);
    let c2 = color(80, 150, 200);
    let c1 = color(60, 120, 180);
  
    for (let y = 0; y < height; y++) { 
      let inter = map(y, 0, height / 2, 0, 1);
      let c;
      if (inter < 0.5) {
        c = lerpColor(c1, c2, inter * 2);
      } else {
        c = lerpColor(c2, c3, (inter - 0.5) * 2);
      }
      stroke(c);
      line(0, y, width, y);
    }
  }
}

class WallFeature {
  constructor(relativeSize, fillColor) {
    this.relativeSize = relativeSize; 
    this.fillColor = fillColor;
  }
  
  display(centerX, centerY, w, h) {
    let diameter = h * this.relativeSize;
    fill(this.fillColor);
    noStroke();
    ellipse(centerX, centerY, diameter, diameter);
  }
}
