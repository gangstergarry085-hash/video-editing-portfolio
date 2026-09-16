import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import dotenv from 'dotenv';

import { ensureLocalDb } from './ensureLocalDb.js';

dotenv.config();

const SALT_ROUNDS = 12;

async function seed() {
  await ensureLocalDb();
  const client = await pool.connect();
  const adminOnly = process.argv.includes('--admin-only');

  try {
    // ── Admin user ─────────────────────────────────────
    const email = (process.env.ADMIN_EMAIL || 'admin@devanand.com').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'garry@2004';
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    await client.query(`
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (email) DO UPDATE SET password_hash = $2, updated_at = NOW()
    `, [email, hash]);
    console.log(`✔ Admin user seeded: ${email}`);

    if (adminOnly) {
      console.log('Admin-only seed complete.');
      return;
    }

    // ── About ──────────────────────────────────────────
    const { rowCount: aboutExists } = await client.query('SELECT 1 FROM about LIMIT 1');
    if (aboutExists === 0) {
      await client.query(`
        INSERT INTO about (name, role, bio, experience, location, availability_status, social_links, tools)
        VALUES (
          'Dev Anand',
          'Video Editor & Motion Graphics Designer',
          'I''m Dev Anand — a video editor and motion graphics designer with a passion for cinematic storytelling. I believe every frame should earn its place in the timeline. From raw footage to polished final cuts, I bring stories to life through precise editing, dynamic motion graphics, and thoughtful sound design.',
          '~1 Year',
          'India',
          'Available for Projects',
          '{}',
          $1
        )
      `, [JSON.stringify([
        { name: 'DaVinci Resolve', category: 'Editing' },
        { name: 'After Effects', category: 'Motion Graphics' },
        { name: 'Premiere Pro', category: 'Editing' },
        { name: 'Photoshop', category: 'Design' },
      ])]);
      console.log('✔ About seeded');
    } else {
      console.log('  ✓ About already exists');
    }

    // ── Settings ───────────────────────────────────────
    const { rowCount: settingsExists } = await client.query('SELECT 1 FROM settings LIMIT 1');
    if (settingsExists === 0) {
      await client.query(`
        INSERT INTO settings (
          site_title, hero_heading, hero_subheading, hero_statement,
          availability_status, accent_color, email,
          meta_title, meta_description, footer_text, process_steps
        ) VALUES (
          'Dev Anand — Video Editor',
          'DEV ANAND',
          'VIDEO EDITOR · MOTION DESIGNER · VISUAL STORYTELLER',
          'YOU WATCH. / I EDIT.',
          'Available for Projects',
          '#E50914',
          '',
          'Dev Anand — Video Editor & Motion Designer',
          'Portfolio of Dev Anand — Video Editor, Motion Graphics Designer, and Visual Storyteller.',
          '© Dev Anand. All rights reserved.',
          $1
        )
      `, [JSON.stringify([
        { step: 1, title: 'Briefing', description: 'Understanding your vision, target audience, and project goals.' },
        { step: 2, title: 'Raw Review', description: 'Reviewing all footage, selecting the best takes, and organizing assets.' },
        { step: 3, title: 'Assembly Cut', description: 'Building the initial structure — story arc, pacing, and flow.' },
        { step: 4, title: 'Fine Cut', description: 'Refining transitions, timing, and adding motion graphics.' },
        { step: 5, title: 'Color & Sound', description: 'Color grading, sound design, music sync, and audio mixing.' },
        { step: 6, title: 'Final Delivery', description: 'Export in all required formats, revisions, and handoff.' },
      ])]);
      console.log('✔ Settings seeded');
    } else {
      console.log('  ✓ Settings already exist');
    }

    // ── Services ───────────────────────────────────────
    const { rowCount: servicesExist } = await client.query('SELECT 1 FROM services LIMIT 1');
    if (servicesExist === 0) {
      const services = [
        { name: 'Short-form Content', description: 'Reels, TikToks, and short-form video optimized for engagement and retention.' },
        { name: 'YouTube Editing', description: 'Full YouTube video editing — cuts, pacing, graphics, and thumbnails.' },
        { name: 'Motion Graphics', description: 'Animated titles, lower thirds, transitions, and visual effects.' },
        { name: 'Cinematic Editing', description: 'Film-style editing with cinematic color grading and storytelling.' },
        { name: 'Brand & Promotional Videos', description: 'Polished promotional content for brands, products, and campaigns.' },
        { name: 'Color Grading', description: 'Professional color correction and grading to set the mood.' },
        { name: 'Sound Design', description: 'Audio mixing, sound effects, and music synchronization.' },
      ];

      for (let i = 0; i < services.length; i++) {
        await client.query(
          'INSERT INTO services (name, description, display_order, published) VALUES ($1, $2, $3, TRUE)',
          [services[i].name, services[i].description, i]
        );
      }
      console.log('✔ Services seeded (7 entries)');
    } else {
      console.log('  ✓ Services already exist');
    }

    // ── Sample project (Star Excellent Academy) ───────
    const { rowCount: projectsExist } = await client.query('SELECT 1 FROM projects LIMIT 1');
    if (projectsExist === 0) {
      await client.query(`
        INSERT INTO projects (
          title, slug, category, description, short_description,
          tools, client_name, client_description, dev_role,
          services_provided, project_year, project_type,
          featured, published, display_order
        ) VALUES (
          'Star Excellent Academy',
          'star-excellent-academy',
          'Client Work',
          'Promotional video project for Star Excellent Academy — a real paid client engagement. Handled end-to-end video editing and motion graphics for the academy''s promotional content.',
          'Promotional video for Star Excellent Academy.',
          $1, 'Star Excellent Academy',
          'An educational academy seeking professional video content for promotion.',
          'Video Editor & Motion Graphics Designer',
          $2, 2024, 'Promotional Video',
          TRUE, TRUE, 0
        )
      `, [
        ['DaVinci Resolve', 'After Effects', 'Photoshop'],
        ['Video Editing', 'Motion Graphics', 'Color Grading'],
      ]);
      console.log('✔ Sample project seeded (Star Excellent Academy)');
    } else {
      console.log('  ✓ Projects already exist');
    }

    // ── Default showreel row ──────────────────────────
    const { rowCount: showreelExists } = await client.query('SELECT 1 FROM showreels LIMIT 1');
    if (showreelExists === 0) {
      await client.query(`
        INSERT INTO showreels (title, description, active)
        VALUES ('Main Showreel', 'Dev Anand — Video Editing Showreel', TRUE)
      `);
      console.log('✔ Showreel placeholder seeded');
    } else {
      console.log('  ✓ Showreel already exists');
    }

    console.log('\nSeed complete!');
  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
