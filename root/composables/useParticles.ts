import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';

interface ParticleNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
}

interface DataPacket {
  fromNode: ParticleNode;
  toNode: ParticleNode;
  progress: number;
  speed: number;
}

export function useParticles(canvasRef: Ref<HTMLCanvasElement | null>) {
  let animationFrameId = 0;
  const nodes: ParticleNode[] = [];
  const packets: DataPacket[] = [];
  const timelineAnchor = ref<{ x: number; y: number } | null>(null);

  // Mouse tracking
  const mouse = {
    x: null as number | null,
    y: null as number | null,
    radius: 180,
  };

  function handleAnchorUpdate(e: CustomEvent<{ x: number; y: number }>) {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    timelineAnchor.value = {
      x: e.detail.x - rect.left,
      y: e.detail.y - rect.top,
    };
  }

  function handleMouseMove(e: MouseEvent) {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }

  function handleMouseLeave() {
    mouse.x = null;
    mouse.y = null;
  }

  function initParticles(width: number, height: number) {
    nodes.length = 0;
    packets.length = 0;

    // Determine number of particles based on screen size
    const density = (width * height) / 16000;
    const count = Math.min(Math.max(Math.floor(density), 40), 90);

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 2 + 1.5;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius,
        baseRadius: radius,
      });
    }

    // Set default fallback anchor coordinate if not yet received or size changed
    if (!timelineAnchor.value || timelineAnchor.value.y === height) {
      timelineAnchor.value = {
        x: width / 2,
        y: height,
      };
    }
  }

  function animate() {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 1. Determine which nodes are pulled towards the timeline anchor
    let pulledNodes = new Set<ParticleNode>();
    const ax = timelineAnchor.value?.x ?? (width / 2);
    const ay = timelineAnchor.value?.y ?? height;

    if (nodes.length > 0) {
      const sorted = [...nodes]
        .map(node => {
          const dx = ax - node.x;
          const dy = ay - node.y;
          return { node, dist: Math.hypot(dx, dy) };
        })
        .sort((a, b) => a.dist - b.dist);
      
      // Select the 3 closest nodes
      pulledNodes = new Set(sorted.slice(0, 3).map(item => item.node));
    }

    // 2. Update and Draw Nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      let isPulled = pulledNodes.has(node);
      let dist = 0;

      if (isPulled) {
        const dx = ax - node.x;
        const dy = ay - node.y;
        dist = Math.hypot(dx, dy);

        if (dist < 6) {
          // Hit the anchor! Respawn elsewhere in the upper 80% of canvas.
          node.x = Math.random() * width;
          node.y = Math.random() * (height * 0.8);
          node.vx = (Math.random() - 0.5) * 0.4;
          node.vy = (Math.random() - 0.5) * 0.4;
          dist = 0;
          isPulled = false;
        } else {
          // Steer towards anchor (Craig Reynolds steering)
          const steerX = (dx / dist) * 0.15;
          const steerY = (dy / dist) * 0.15;
          node.vx += steerX;
          node.vy += steerY;

          const speed = Math.hypot(node.vx, node.vy);
          const maxSpeed = 2.2;
          if (speed > maxSpeed) {
            node.vx = (node.vx / speed) * maxSpeed;
            node.vy = (node.vy / speed) * maxSpeed;
          }

          node.x += node.vx;
          node.y += node.vy;
        }
      }

      if (!isPulled) {
        // Standard mouse interaction (subtle attraction)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const distance = Math.hypot(dx, dy);

          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            node.x += (dx / distance) * force * 0.6;
            node.y += (dy / distance) * force * 0.6;
          }
        }

        // Physical movement
        node.x += node.vx;
        node.y += node.vy;

        // Boundaries bounce with friction/re-align
        if (node.x < 0) {
          node.x = 0;
          node.vx *= -1;
        } else if (node.x > width) {
          node.x = width;
          node.vx *= -1;
        }
        if (node.y < 0) {
          node.y = 0;
          node.vy *= -1;
        } else if (node.y > height) {
          node.y = height;
          node.vy *= -1;
        }
      }

      // Draw node
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      
      if (isPulled) {
        // Shift color towards timeline bright blue/cyan as it gets closer
        const ratio = 1 - Math.min(dist / 200, 1);
        ctx.fillStyle = `rgba(${147 + (56 - 147) * ratio}, ${197 + (189 - 197) * ratio}, ${253 + (248 - 253) * ratio}, ${0.4 + 0.5 * ratio})`;
      } else {
        ctx.fillStyle = 'rgba(147, 197, 253, 0.4)'; // light blue accent
      }
      
      ctx.fill();
    }

    // 2. Build Connections and Draw Lines
    const connections: [ParticleNode, ParticleNode, number][] = [];
    const maxDistance = 150;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * 0.12;
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = `rgba(147, 197, 253, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          connections.push([n1, n2, dist]);
        }
      }
    }

    // 3. Manage & Draw Data Packets (Kafka stream representation)
    // Occasional spawning
    if (packets.length < 15 && connections.length > 0 && Math.random() < 0.08) {
      // Pick a random connection to spawn a packet along
      const conn = connections[Math.floor(Math.random() * connections.length)];
      // Random direction
      const [fromNode, toNode] = Math.random() > 0.5 ? [conn[0], conn[1]] : [conn[1], conn[0]];
      
      // Check if a packet is already traveling this direction on this node pair
      const exists = packets.some(p => p.fromNode === fromNode && p.toNode === toNode);
      if (!exists) {
        packets.push({
          fromNode,
          toNode,
          progress: 0,
          speed: (Math.random() * 0.01) + 0.005, // travel speed percentage per frame
        });
      }
    }

    // Update and draw packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const packet = packets[i];
      packet.progress += packet.speed;

      if (packet.progress >= 1) {
        packets.splice(i, 1);
        continue;
      }

      // Interpolate coordinates
      const px = packet.fromNode.x + (packet.toNode.x - packet.fromNode.x) * packet.progress;
      const py = packet.fromNode.y + (packet.toNode.y - packet.fromNode.y) * packet.progress;

      // Draw glowing data packet
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#60a5fa'; // vibrant blue
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  let resizeObserver: ResizeObserver | null = null;

  onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (parent) {
      // Setup ResizeObserver to handle element size changes accurately
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          canvas.width = width;
          canvas.height = height;
          initParticles(width, height);
        }
      });
      resizeObserver.observe(parent);
      
      // Fallback/Initial sizing
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initParticles(rect.width, rect.height);
    }

    // Mouse event listeners on parent to make interaction feel natural
    parent?.addEventListener('mousemove', handleMouseMove);
    parent?.addEventListener('mouseleave', handleMouseLeave);

    window.addEventListener('timeline-anchor-updated', handleAnchorUpdate as EventListener);

    animate();
  });

  onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrameId);
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    const canvas = canvasRef.value;
    const parent = canvas?.parentElement;
    if (parent) {
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
    }
    window.removeEventListener('timeline-anchor-updated', handleAnchorUpdate as EventListener);
  });
}
