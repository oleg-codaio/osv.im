import AOS from 'aos';
import Vue from 'vue';
import VueScrollActive from 'vue-scrollactive';

if (process.browser) {
  AOS.init();
}

Vue.use(VueScrollActive);

export default {};
