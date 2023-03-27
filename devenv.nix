{ pkgs, ... }:

{
  # https://devenv.sh/packages/
  packages = [
    pkgs.git
    pkgs.nodejs-16_x
  ];

  # https://devenv.sh/languages/
  # languages.nix.enable = true;

}
