import React from "react";
import { Twitter, Instagram, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";

const TeamCard = ({
  name,
  title,
  image,
  twitter,
  instagram,
  linkedin,
  isActive,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col transition-all duration-500 ease-in-out transform",
        isActive ? "opacity-100 scale-100" : "opacity-60 scale-95"
      )}
    >
      <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
        <img src={image} alt={name} className="object-cover w-full h-full" />
      </div>

      <h2 className="text-2xl font-medium mb-1">{name}</h2>
      <p className="text-muted-foreground mb-4">{title}</p>

      <ul className="flex space-x-4">
        <li>
          <a
            href={twitter}
            rel="noreferrer"
            target="_blank"
            className="text-gray-600 hover:text-primary transition-colors"
            aria-label={`${name}'s Twitter`}
          >
            <Twitter className="w-5 h-5" />
          </a>
        </li>
        <li>
          <a
            href={instagram}
            rel="noreferrer"
            target="_blank"
            className="text-gray-600 hover:text-primary transition-colors"
            aria-label={`${name}'s Instagram`}
          >
            <Instagram className="w-5 h-5" />
          </a>
        </li>
        <li>
          <a
            href={linkedin}
            rel="noreferrer"
            target="_blank"
            className="text-gray-600 hover:text-primary transition-colors"
            aria-label={`${name}'s LinkedIn`}
          >
            <Linkedin className="w-5 h-5" />
          </a>
        </li>
      </ul>
    </div>
  );
};

export default TeamCard;
