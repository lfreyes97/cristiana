{
  description = "Cristianamente Astro Project Dev Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        # Create an FHS environment to run binaries like workerd
        fhs = pkgs.buildFHSUserEnv {
          name = "fhs-shell";
          targetPkgs = pkgs: with pkgs; [
            bun
            nodejs_22
            # Add libs commonly needed by prebuilt binaries
          ];
          runScript = "zsh";
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            pkgs.bun
            pkgs.nodejs_22
            # Use steam-run as a quick wrapper if FHS is too heavy
            pkgs.steam-run
          ];

          shellHook = ''
            echo "Environment prepared. Use 'steam-run bun dev' to run the server if workerd fails."
          '';
        };
      }
    );
}
