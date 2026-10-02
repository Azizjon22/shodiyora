-- AlterEnum: two new gallery sections so "To'yxona taomlari" and "San'atkor"
-- in the package "includes" list can show their own uploaded photo/video,
-- same as the existing Kortej/Fotosuratchi sections.
ALTER TYPE "MenuMediaSection" ADD VALUE 'FOOD' BEFORE 'KORTEJ';
ALTER TYPE "MenuMediaSection" ADD VALUE 'ARTIST' AFTER 'KORTEJ';
